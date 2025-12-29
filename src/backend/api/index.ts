import * as vscode from "vscode";
import { XmlHelper } from "../application/helpers/xmlHelper";
import { DesignerHelper } from "../application/helpers/designerHelper";
import { AccessibilityType } from "../../shared/eventArgs/accessibility/accessibilityType";
import { WebViewService } from "../application/services/webViewService";
import { EditorViewController } from "./controllers/editorViewController";
import { AccessibilityController } from "./controllers/accessibilityController";

export class ResourceEditorProvider implements vscode.CustomTextEditorProvider {
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
    const accessibilityController = new AccessibilityController(webviewPanel, this.context);

    const endpoints = {
      ...editorViewController.MapEndpoints(),
      ...accessibilityController.MapEndpoints(),
    };

    webViewService.UpdateWebview(document);
    webviewPanel.webview.options = {
      enableScripts: true,
    };

    const saveSubscription = vscode.workspace.onDidSaveTextDocument((doc) => {
      if (doc.uri.toString() === document.uri.toString()) {
        DesignerHelper.GenerateDesignerFile(doc);
      }
    });

    webviewPanel.onDidDispose(() => {
      saveSubscription.dispose();
    });

    webviewPanel.webview.onDidReceiveMessage(async (e) => {
      const handler = endpoints[e.type];

      if (!handler) {
        console.warn(`No endpoint registered for route: ${e.type}`);
        return;
      }

      await handler(document, e.eventArgs);
    });
  }
}
