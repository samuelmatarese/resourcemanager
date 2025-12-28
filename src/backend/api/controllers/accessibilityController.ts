import * as vscode from "vscode";
import { Routes } from "../../../shared/vscodeRoutes";
import { AccessibilityService } from "../../application/services/accessibilityService";
import { WebViewService } from "../../application/services/webViewService";
import { GetAccessibilityEventArgs } from "../../../webview/events/accessibility/getAccessibilityEventArgs";

export class AccessibilityController {
  private _webViewService: WebViewService;

  constructor(webViewPanel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    this._webViewService = new WebViewService(webViewPanel, context);
  }

  public async MapEndpoints(route: string, document: vscode.TextDocument, args: any) {
    switch (route) {
      case Routes.UpdateAccessibility:
        await AccessibilityService.UpdateAccessibility(document, args);
        this._webViewService.UpdateAccessibility(args);
        return;

      case Routes.GetAccessibility:
        const accessibility = AccessibilityService.GetAccessibility(document);
        const getArgs: GetAccessibilityEventArgs = {
          accessibilityType: accessibility,
        };
        
        this._webViewService.GetAccessibility(getArgs);
        return;
    }
  }
}
