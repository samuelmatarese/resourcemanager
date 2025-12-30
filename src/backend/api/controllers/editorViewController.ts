import * as vscode from "vscode";
import { Routes } from "../../../shared/constants/vscodeRoutes";
import { EditorViewService } from "../../application/services/editorViewService";
import { WebViewService } from "../../application/services/webViewService";
import { RouteHandler } from "../route/routeHandler";

export class EditorViewController {
  private _webViewService: WebViewService;
  private _handlers: Record<string, RouteHandler> = {
    [Routes.AddEntry]: this.HandleAddEntry.bind(this),
    [Routes.EditEntry]: this.HandleEditEntry.bind(this),
    [Routes.DeleteEntry]: this.HandleDeleteEntry.bind(this),
    [Routes.SearchRoute]: this.HandleSearchEntry.bind(this),
  };

  constructor(webViewPanel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    this._webViewService = new WebViewService(webViewPanel, context);
  }

  public MapEndpoints(): Record<string, RouteHandler> {
    return this._handlers;
  }

  private async HandleAddEntry(document: vscode.TextDocument, args: any) {
    const id = await EditorViewService.AddEntry(document);
    this._webViewService.AddEntry(id, document);
  }

  private async HandleEditEntry(document: vscode.TextDocument, args: any) {
    const updateArgs = await EditorViewService.EditEntry(document, args);
    this._webViewService.SingleUpdateWebview(document, updateArgs);
  }

  private async HandleDeleteEntry(document: vscode.TextDocument, args: any) {
    await EditorViewService.DeleteEntry(document, args);
    this._webViewService.DeleteEntry(document, args);
  }

  private async HandleSearchEntry(document: vscode.TextDocument, args: any) {
    const ids = await EditorViewService.SearchEntries(document, args);
    this._webViewService.FilterEntries(ids);
  }
}
