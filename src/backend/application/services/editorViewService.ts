import * as vscode from "vscode";
import { XmlHelper } from "../helpers/xmlHelper";
import { UpdateEntryEventArgs } from "../../../shared/eventArgs/entry/updateEntryEventArgs";
import { DeleteEntryEventArgs } from "../../../shared/eventArgs/entry/deleteEntryEventArgs";
import { SearchbarInputEventArgs } from "../../../shared/eventArgs/searchbar/searchbarInputEventArgs";

export class EditorViewService {
  public static async AddEntry(document: vscode.TextDocument): Promise<string> {
    const edit = new vscode.WorkspaceEdit();
    const xmlText = document.getText();
    const rootCloseTag = "</root>";
    const insertOffset = xmlText.lastIndexOf(rootCloseTag);
    const id = crypto.randomUUID();

    if (insertOffset === -1) {
      vscode.window.showErrorMessage("No  </root>-Tag found.");
      throw new Error("No  </root>-Tag found.");
    }

    edit.insert(document.uri, document.positionAt(insertOffset), XmlHelper.generateFormattedDataXml(id) + "\n");
    await vscode.workspace.applyEdit(edit);
    return id;
  }

  public static async EditEntry(document: vscode.TextDocument, args: UpdateEntryEventArgs): Promise<UpdateEntryEventArgs> {
    const edit = new vscode.WorkspaceEdit();
    let updateEntryEventArgs: UpdateEntryEventArgs;
    let newText = "";

    [newText, updateEntryEventArgs] = XmlHelper.editSingleEntry(document, args);

    const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length));

    edit.replace(document.uri, fullRange, newText);
    await vscode.workspace.applyEdit(edit);
    return updateEntryEventArgs;
  }

  public static async DeleteEntry(document: vscode.TextDocument, args: DeleteEntryEventArgs) {
    const edit = new vscode.WorkspaceEdit();
    const text = document.getText();

    const regex = new RegExp(`(?:\\r?\\n)?\\s*<data[^>]*id="${args.id}"[^>]*>[\\s\\S]*?<\\/data>\\s*(?:\\r?\\n)?`, "g");
    const match = regex.exec(text);

    if (match && match.index !== undefined) {
      const startPos = document.positionAt(match.index);
      const endPos = document.positionAt(match.index + match[0].length);
      const range = new vscode.Range(startPos, endPos);

      edit.delete(document.uri, range);
      await vscode.workspace.applyEdit(edit);
    } else {
      vscode.window.showWarningMessage(`No entry with id="${args.id}" found.`);
    }
  }

  public static SearchEntries(document: vscode.TextDocument, args: SearchbarInputEventArgs): string[] {
    return XmlHelper.filterEntriesBySearchText(document, args.searchText);
  }
}
