import * as vscode from "vscode";
import { getNonce } from "./util";
import { UpdateEntryEventArgs } from "../webview/events/entry/updateEntryEventArgs";
import { UpdateType } from "./updateType";
import { XmlHelper } from "./helpers/xmlHelper";
import { Routes } from "../shared/vscodeRoutes";
import { SearchbarInputEventArgs } from "../webview/events/searchbar/searchbarInputEventArgs";
import { DesignerHelper } from "./helpers/designerHelper";
import { AccessibilityType } from "../webview/events/accessibility/accessibilityType";
import { UpdateAccessibilityEventArgs } from "../webview/events/accessibility/updateAccessibilityEventArgs";
import { GetAccessibilityEventArgs } from "../webview/events/accessibility/getAccessibilityEventArgs";
import { ViewTypeMapper } from "./helpers/view/viewMapper";
import { ViewType } from "./helpers/view/viewType";
import { WebViewService } from "./application/services/webViewService";
import { EditorViewController } from "./api/controllers/editorViewController";
import { EditorViewService } from "./application/services/editorViewService";

export class ResourceEditorProvider implements vscode.CustomTextEditorProvider {
  private _updateWebViewType = UpdateType.None;
  private _updateEntryEventArgs: UpdateEntryEventArgs | undefined = undefined;

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new ResourceEditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(ResourceEditorProvider.viewType, provider);
    return providerRegistration;
  }

  private static readonly viewType = "resource.resx";

  constructor(private readonly context: vscode.ExtensionContext) {}

  public async resolveCustomTextEditor(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel, _token: vscode.CancellationToken): Promise<void> {
    if (document.getText().trim().length === 0) {
      const defaultContent = `<?xml version="1.0" encoding="utf-8"?>\n<root>\n\t<accessability>internal</accessability>\n</root>`;
      const edit = new vscode.WorkspaceEdit();
      edit.insert(document.uri, new vscode.Position(0, 0), defaultContent + "\n");
      await vscode.workspace.applyEdit(edit);
      await document.save();
    } else {
      let updatedDoc = XmlHelper.addIdsToAlreadyExistingEntries(document);
      const accessability = XmlHelper.checkAccessability(document);

      if (accessability === null) {
        updatedDoc = XmlHelper.createAccessability(updatedDoc, AccessibilityType.Internal);
      }

      const edit = new vscode.WorkspaceEdit();
      edit.replace(document.uri, new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length)), updatedDoc);
      await vscode.workspace.applyEdit(edit);
      await document.save();
    }

    const webViewService = new WebViewService(webviewPanel, this.context);
    const editorViewController = new EditorViewController(webviewPanel, this.context);

    webViewService.UpdateWebview(document);
    webviewPanel.webview.options = {
      enableScripts: true,
    };

    function updateAccessibility(args: UpdateAccessibilityEventArgs) {
      webviewPanel.webview.postMessage({
        type: Routes.UpdateAccessibility,
        eventArgs: args,
      });
    }

    function getAccessibility(args: GetAccessibilityEventArgs) {
      webviewPanel.webview.postMessage({
        type: Routes.GetAccessibility,
        eventArgs: args,
      });
    }

    function filterEntries(ids: string[]) {
      webviewPanel.webview.postMessage({
        type: Routes.SearchRoute,
        ids: ids,
      });
    }

    const saveSubscription = vscode.workspace.onDidSaveTextDocument((doc) => {
      if (doc.uri.toString() === document.uri.toString()) {
        DesignerHelper.GenerateDesignerFile(doc);
      }
    });

    webviewPanel.onDidDispose(() => {
      saveSubscription.dispose();
    });

    webviewPanel.webview.onDidReceiveMessage(async (e) => {
      await editorViewController.MapEndpoints(e.type, document, e.eventArgs);
      switch (e.type) {
        case Routes.SearchRoute:
          const ids = this.searchEntries(document, e.eventArgs);
          filterEntries(ids);
          return;

        case Routes.UpdateAccessibility:
          await this.updateAccessibility(document, e.eventArgs);
          updateAccessibility(e.eventArgs);
          return;

        case Routes.GetAccessibility:
          const accessibility = this.getAccessibility(document);
          const args: GetAccessibilityEventArgs = {
            accessibilityType: accessibility,
          };
          getAccessibility(args);
          return;
      }
    });
  }

  private searchEntries(document: vscode.TextDocument, args: SearchbarInputEventArgs): string[] {
    return XmlHelper.filterEntriesBySearchText(document, args.searchText);
  }

  private async updateAccessibility(document: vscode.TextDocument, args: UpdateAccessibilityEventArgs) {
    const edit = new vscode.WorkspaceEdit();
    const updatedDoc = XmlHelper.createAccessability(document.getText(), args.accessibilityType);
    const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length));

    edit.replace(document.uri, fullRange, updatedDoc);
    await vscode.workspace.applyEdit(edit);
  }

  private getAccessibility(document: vscode.TextDocument) {
    const accessibility = XmlHelper.checkAccessability(document);

    if (accessibility === null || accessibility === undefined) {
      vscode.window.showErrorMessage("file is not correctly formatted. Accessability is missing");
      throw new Error("file is not correctly formatted. Accessability is missing");
    }

    return accessibility;
  }
}
