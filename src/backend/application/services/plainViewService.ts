import { UpdatePlainTextEventArgs } from "../../../shared/eventArgs/plainView/updatePlainTextEventArgs";
import * as vscode from "vscode";

export class PlainViewService {
  public static async ChangeText(document: vscode.TextDocument, args: UpdatePlainTextEventArgs) {
    const edit = new vscode.WorkspaceEdit();
    const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length));

    edit.replace(document.uri, fullRange, args.newValue);
    await vscode.workspace.applyEdit(edit);
  }
}
