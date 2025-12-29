import * as vscode from "vscode";

export type RouteHandler = (
  document: vscode.TextDocument,
  args: any
) => Promise<void>;