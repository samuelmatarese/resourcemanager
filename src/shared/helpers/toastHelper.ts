import * as vscode from "vscode";

export class ToastHelper {
  public static ShowError(message: string) {
    vscode.window.showErrorMessage(message);
  }
}
