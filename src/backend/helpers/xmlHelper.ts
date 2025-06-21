import { XMLSerializer, DOMParser } from "xmldom";
import type { TextDocument } from "vscode";
import { UpdateEntryEventArgs } from "../../webview/events/entry/updateEntryEventArgs";
import { CellType } from "../../webview/cellType";

export class XmlHelper {
  public static findEntryById(id: string, entries: HTMLCollectionOf<HTMLDataElement>): HTMLDataElement {
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].getAttribute("id") == id) {
        return entries[i];
      }
    }

    throw new Error("No entry found with id: " + id);
  }

  public static EditSingleEntry(document: TextDocument, args: UpdateEntryEventArgs): [string, UpdateEntryEventArgs] {
    const xmlDoc = this.getDocumentAsXml(document);
    let entries = xmlDoc.getElementsByTagName("data");
    let entry = XmlHelper.findEntryById(args.id, entries);

    switch (args.cellType) {
      case CellType.Name:
        entry.setAttribute("name", args.newValue);
        break;

      case CellType.Value:
        let entryValue = entry.getElementsByTagName("value")[0];
        entryValue.textContent = args.newValue;
        break;

      case CellType.Comment:
        let entryComment = entry.getElementsByTagName("comment")[0];
        entryComment.textContent = args.newValue;
        break;
    }

    const serializer = new XMLSerializer();
    const newText = serializer.serializeToString(xmlDoc);
    const updateEntryEventArgs: UpdateEntryEventArgs = {
      cellType: args.cellType,
      id: args.id,
      newValue: args.newValue,
    };

    return [newText, updateEntryEventArgs];
  }

  public static filterEntriesBySearchText(document: TextDocument, searchText: string): string[] {
    const xmlDoc = this.getDocumentAsXml(document);
    let entries = Array.from(xmlDoc.getElementsByTagName("data"));
    let ids: string[] = [];
    searchText = searchText.toLowerCase();

    entries.forEach((e) => {
      const entryValue = e.getElementsByTagName("value")[0].textContent?.toLowerCase();
      const entryComment = e.getElementsByTagName("comment")[0].textContent?.toLowerCase();

      if (e.getAttribute("name")?.toLowerCase().includes(searchText) || entryValue?.includes(searchText) || entryComment?.includes(searchText)) {
        const id = e.getAttribute("id");
        if (id != null) {
          ids.push(id);
        }
      }
    });

    return ids;
  }

  private static getDocumentAsXml(document: TextDocument): XMLDocument {
    var parser = new DOMParser();
    return parser.parseFromString(document.getText());
  }
}
