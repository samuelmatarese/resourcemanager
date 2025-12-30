import * as vscode from "vscode";
import { Routes } from "../../../shared/constants/vscodeRoutes";
import { PlainViewService } from "../../application/services/plainViewService";
import { RouteHandler } from "../route/routeHandler";
import { WebViewService } from "../../application/services/webViewService";

export class PlainViewController {
  private _webViewService: WebViewService;
  private _handlers: Record<string, RouteHandler> = {
    [Routes.EditPlainText]: this.HandleEditPlainText.bind(this),
  };

  constructor(webViewPanel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    this._webViewService = new WebViewService(webViewPanel, context);
  }

  public MapEndpoints(): Record<string, RouteHandler> {
    return this._handlers;
  }

  private async HandleEditPlainText(document: vscode.TextDocument, args: any) {
    await PlainViewService.ChangeText(document, args);
    this._webViewService.UpdateWebview(document, undefined, false);
  }
}
