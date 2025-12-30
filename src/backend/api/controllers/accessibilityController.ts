import * as vscode from "vscode";
import { Routes } from "../../../shared/constants/vscodeRoutes";
import { AccessibilityService } from "../../application/services/accessibilityService";
import { WebViewService } from "../../application/services/webViewService";
import { GetAccessibilityEventArgs } from "../../../shared/eventArgs/accessibility/getAccessibilityEventArgs";
import { RouteHandler } from "../route/routeHandler";

export class AccessibilityController {
  private _webViewService: WebViewService;
  private _handlers: Record<string, RouteHandler> = {
    [Routes.UpdateAccessibility]: this.HandleUpdateAccessibility.bind(this),
    [Routes.GetAccessibility]: this.HandleGetAccessibility.bind(this),
  };

  constructor(webViewPanel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    this._webViewService = new WebViewService(webViewPanel, context);
  }

  public MapEndpoints(): Record<string, RouteHandler> {
    return this._handlers;
  }

  private async HandleUpdateAccessibility(document: vscode.TextDocument, args: any) {
    await AccessibilityService.UpdateAccessibility(document, args);
    this._webViewService.UpdateAccessibility(args);
  }

  private async HandleGetAccessibility(document: vscode.TextDocument, args: any) {
    const accessibility = AccessibilityService.GetAccessibility(document);
    const getArgs: GetAccessibilityEventArgs = {
      accessibilityType: accessibility,
    };

    this._webViewService.GetAccessibility(getArgs);
  }
}
