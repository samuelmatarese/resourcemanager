import * as vscode from "vscode";

export class ExtensionContextProvider {
  private static _context: vscode.ExtensionContext;

  private constructor() {}

  public static Set(context: vscode.ExtensionContext) {
    this._context = context;
  }

  public static Get(): vscode.ExtensionContext {
    return this._context;
  }
}
