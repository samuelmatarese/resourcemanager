import * as vscode from "vscode";
import { Routes } from "../../../shared/vscodeRoutes";
import { EditorViewService } from "../../application/services/editorViewService";
import { WebViewService } from "../../application/services/webViewService";

export class EditorViewController {
  private _webViewService: WebViewService;

  constructor(webViewPanel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    this._webViewService = new WebViewService(webViewPanel, context);
  }

  public async MapEndpoints(route: string, document: vscode.TextDocument, args: any) {
    switch (route) {
      case Routes.AddEntry:
        const id = await EditorViewService.AddEntry(document);
        this._webViewService.AddEntry(id, document);
        return;

      case Routes.EditEntry:
        const updateArgs = await EditorViewService.EditEntry(document, args);
        this._webViewService.SingleUpdateWebview(document, updateArgs);
        return;

      case Routes.DeleteEntry:
        await EditorViewService.DeleteEntry(document, args);
        this._webViewService.UpdateWebview(document);
        return;
    }
  }
}
