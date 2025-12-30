import * as vscode from "vscode";
import { Routes } from "../../../shared/constants/vscodeRoutes";
import { WebViewService } from "../../application/services/webViewService";
import { RouteHandler } from "../route/routeHandler";

export class WebViewController {
  private _webViewService: WebViewService;
  private _handlers: Record<string, RouteHandler> = {
    [Routes.UpdateWebView]: this.HandleUpdateWebView.bind(this),
  };

  constructor(webViewPanel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    this._webViewService = new WebViewService(webViewPanel, context);
  }

  public MapEndpoints(): Record<string, RouteHandler> {
    return this._handlers;
  }

  private async HandleUpdateWebView(document: vscode.TextDocument, args: any) {
    this._webViewService.UpdateWebview(document, args);
  }
}