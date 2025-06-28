import * as vscode from "vscode";
import { getNonce } from "./util";
import { UpdateEntryEventArgs } from "../webview/events/entry/updateEntryEventArgs";
import { UpdateType } from "./updateType";
import { XmlHelper } from "./helpers/xmlHelper";
import { Routes } from "../webview/constants/vscodeRoutes";
import { SearchbarInputEventArgs } from "../webview/events/searchbar/searchbarInputEventArgs";
import { DesignerHelper } from "./helpers/designerHelper";
import { AccessibilityType } from "../webview/events/accessibility/accessibilityType";
import { UpdateAccessibilityEventArgs } from "../webview/events/accessibility/updateAccessibilityEventArgs";
import { GetAccessibilityEventArgs } from "../webview/events/accessibility/getAccessibilityEventArgs";

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

    updateWebview();

    webviewPanel.webview.options = {
      enableScripts: true,
    };

    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    function updateWebview() {
      webviewPanel.webview.postMessage({
        type: Routes.UpdateAllRoute,
        text: document.getText(),
      });
    }

    function singleUpdateWebview(args: UpdateEntryEventArgs) {
      webviewPanel.webview.postMessage({
        type: Routes.UpdateSingleEntryRoute,
        eventArgs: {
          id: args.id,
          newValue: args.newValue,
          cellType: args.cellType,
        },
      });
    }

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

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.toString() === document.uri.toString() && this._updateWebViewType === UpdateType.Full) {
        updateWebview();
      } else if (e.document.uri.toString() === document.uri.toString() && this._updateWebViewType === UpdateType.Single && this._updateEntryEventArgs !== undefined) {
        singleUpdateWebview(this._updateEntryEventArgs);
        this._updateEntryEventArgs = undefined;
      }

      this._updateWebViewType = UpdateType.None;
    });

    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
      saveSubscription.dispose();
    });

    webviewPanel.webview.onDidReceiveMessage(async (e) => {
      switch (e.type) {
        case Routes.AddEntry:
          this._updateWebViewType = UpdateType.Full;
          this.addEntry(document);
          return;

        case Routes.EditEntry:
          this._updateWebViewType = UpdateType.Single;
          await this.editEntry(document, e.eventArgs);
          return;

        case Routes.DeleteEntry:
          this._updateWebViewType = UpdateType.Full;
          this.deleteEntry(document, e.id);
          return;

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

  private addEntry(document: vscode.TextDocument) {
    return this.insertDefaultResource(document);
  }

  private deleteEntry(document: vscode.TextDocument, id: string) {
    return this.removeEntry(document, id);
  }

  private searchEntries(document: vscode.TextDocument, args: SearchbarInputEventArgs): string[] {
    return XmlHelper.filterEntriesBySearchText(document, args.searchText);
  }

  private insertDefaultResource(document: vscode.TextDocument) {
    const edit = new vscode.WorkspaceEdit();
    const xmlText = document.getText();
    const rootCloseTag = "</root>";
    const insertOffset = xmlText.lastIndexOf(rootCloseTag);

    if (insertOffset === -1) {
      vscode.window.showErrorMessage("No  </root>-Tag found.");
      return;
    }

    edit.insert(document.uri, document.positionAt(insertOffset), XmlHelper.generateFormattedDataXml() + "\n");

    return vscode.workspace.applyEdit(edit);
  }

  private removeEntry(document: vscode.TextDocument, id: string) {
    const edit = new vscode.WorkspaceEdit();
    const text = document.getText();

    const regex = new RegExp(`(?:\\r?\\n)?\\s*<data[^>]*id="${id}"[^>]*>[\\s\\S]*?<\\/data>\\s*(?:\\r?\\n)?`, "g");
    const match = regex.exec(text);

    if (match && match.index !== undefined) {
      const startPos = document.positionAt(match.index);
      const endPos = document.positionAt(match.index + match[0].length);
      const range = new vscode.Range(startPos, endPos);

      edit.delete(document.uri, range);
      return vscode.workspace.applyEdit(edit);
    } else {
      vscode.window.showWarningMessage(`No entry with id="${id}" found.`);
      return;
    }
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

  private async editEntry(document: vscode.TextDocument, args: UpdateEntryEventArgs) {
    const edit = new vscode.WorkspaceEdit();
    let newText = "";

    [newText, this._updateEntryEventArgs] = XmlHelper.editSingleEntry(document, args);

    const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length));

    edit.replace(document.uri, fullRange, newText);
    await vscode.workspace.applyEdit(edit);
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    // Local path to script and css for the webview
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "out", "webview", "webview.js"));

    const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "media", "reset.css"));

    const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "media", "vscode.css"));

    const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "media", "resourceEditor.css"));

    // Use a nonce to whitelist which scripts can be run
    const nonce = getNonce();

    return /* html */ `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">

                <link href="${styleResetUri}" rel="stylesheet" />
                <link href="${styleVSCodeUri}" rel="stylesheet" />
                <link href="${styleMainUri}" rel="stylesheet" />

                <title>Resource Manager</title>
            </head>
            <body>
                <div class="toolbar">
                  <select name="designer-accessability" class="designer-accessability"></select>
                  <input class="searchbar" type="text" placeholder="search...">
                  <button class="create-button">New Entry</button>
                </div>
                <div class="table-wrapper">
                  <table id="resource-table" class="resource-table">
                      <tr class="table-header">
                          <th>Name</th>
                          <th>Value</th>
                          <th>Comment</th>
                      </tr>
                  </table>
                </div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
  }
}
