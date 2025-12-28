import { UpdateAccessibilityEventArgs } from "../../../webview/events/accessibility/updateAccessibilityEventArgs";
import { XmlHelper } from "../../helpers/xmlHelper";
import * as vscode from "vscode";

export class AccessibilityService {
  public static async UpdateAccessibility(document: vscode.TextDocument, args: UpdateAccessibilityEventArgs) {
    const edit = new vscode.WorkspaceEdit();
    const updatedDoc = XmlHelper.createAccessability(document.getText(), args.accessibilityType);
    const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length));

    edit.replace(document.uri, fullRange, updatedDoc);
    await vscode.workspace.applyEdit(edit);
  }

  public static GetAccessibility(document: vscode.TextDocument) {
    const accessibility = XmlHelper.checkAccessability(document);

    if (accessibility === null || accessibility === undefined) {
      vscode.window.showErrorMessage("file is not correctly formatted. Accessability is missing");
      throw new Error("file is not correctly formatted. Accessability is missing");
    }

    return accessibility;
  }
}
