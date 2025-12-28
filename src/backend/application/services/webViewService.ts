import * as vscode from "vscode";
import { Routes } from "../../../shared/constants/vscodeRoutes";
import { UpdateEntryEventArgs } from "../../../shared/eventArgs/entry/updateEntryEventArgs";
import { getNonce } from "../helpers/util";
import { ViewTypeMapper } from "../helpers/view/viewMapper";
import { ViewType } from "../helpers/view/viewType";
import { UpdateAccessibilityEventArgs } from "../../../shared/eventArgs/accessibility/updateAccessibilityEventArgs";
import { GetAccessibilityEventArgs } from "../../../shared/eventArgs/accessibility/getAccessibilityEventArgs";

export class WebViewService {
  constructor(private webviewPanel: vscode.WebviewPanel, private readonly context: vscode.ExtensionContext) {}

  public AddEntry(id: string, document: vscode.TextDocument) {
    this.SetWebViewHtml(document);
    this.webviewPanel.webview.postMessage({
      type: Routes.AddEntry,
      id: id,
      text: document.getText(),
    });
  }

  public UpdateWebview(document: vscode.TextDocument) {
    this.SetWebViewHtml(document);
    this.webviewPanel.webview.postMessage({
      type: Routes.UpdateAllRoute,
      text: document.getText(),
    });
  }

  public SingleUpdateWebview(document: vscode.TextDocument, args: UpdateEntryEventArgs) {
    this.webviewPanel.webview.postMessage({
      type: Routes.UpdateSingleEntryRoute,
      text: document.getText(),
      eventArgs: {
        id: args.id,
        newValue: args.newValue,
        cellType: args.cellType,
      },
    });
  }

  public SetWebViewHtml(document: vscode.TextDocument) {
    this.webviewPanel.webview.html = this.GetHtmlForWebview(this.webviewPanel.webview, document.getText());
  }

  public UpdateAccessibility(args: UpdateAccessibilityEventArgs) {
    this.webviewPanel.webview.postMessage({
      type: Routes.UpdateAccessibility,
      eventArgs: args,
    });
  }

  public GetAccessibility(args: GetAccessibilityEventArgs) {
    this.webviewPanel.webview.postMessage({
      type: Routes.GetAccessibility,
      eventArgs: args,
    });
  }

  public FilterEntries(ids: string[]) {
    this.webviewPanel.webview.postMessage({
      type: Routes.SearchRoute,
      ids: ids,
    });
  }

  private GetHtmlForWebview(webview: vscode.Webview, documentText: string): string {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "out", "webview", "webview.js"));
    const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "media", "reset.css"));
    const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "media", "vscode.css"));
    const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "media", "resourceEditor.css"));
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
              ${ViewTypeMapper.MapToHtmlBody(ViewType.Editor, scriptUri, nonce, documentText)}
              </html>`;
  }
}
