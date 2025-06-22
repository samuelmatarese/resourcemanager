import { XMLSerializer, DOMParser } from "xmldom";
import type { TextDocument } from "vscode";
import { UpdateEntryEventArgs } from "../../webview/events/entry/updateEntryEventArgs";
import { CellType } from "../../webview/cellType";
import { AccessabilityType } from "../../webview/events/accessability/accessabilityType";
import { AccessabilityTypeMapper } from "../designer/accessabilityTypeMapper";

export class XmlHelper {
  public static findEntryById(id: string, entries: HTMLCollectionOf<HTMLDataElement>): HTMLDataElement {
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].getAttribute("id") == id) {
        return entries[i];
      }
    }

    throw new Error("No entry found with id: " + id);
  }

  public static editSingleEntry(document: TextDocument, args: UpdateEntryEventArgs): [string, UpdateEntryEventArgs] {
    const xmlDoc = this.getDocumentAsXml(document);
    let entries = xmlDoc.getElementsByTagName("data");
    let entry = XmlHelper.findEntryById(args.id, entries);

    switch (args.cellType) {
      case CellType.Name:
        args.newValue = args.newValue.replaceAll(" ", "_");
        entry.setAttribute("name", args.newValue);
        break;

      case CellType.Value:
        let entryValue = entry.getElementsByTagName("value")[0];

        if (entryValue == undefined) {
          let valueNode = xmlDoc.createElement("value");
          valueNode.textContent = args.newValue;
          entry.appendChild(valueNode);
        } else {
          entryValue.textContent = args.newValue;
        }

        break;

      case CellType.Comment:
        let entryComment = entry.getElementsByTagName("comment")[0];

        if (entryComment == undefined) {
          let valueNode = xmlDoc.createElement("comment");
          valueNode.textContent = args.newValue;
          entry.appendChild(valueNode);
        } else {
          entryComment.textContent = args.newValue;
        }

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
      const entryComment = e.getElementsByTagName("comment")[0];

      if (e.getAttribute("name")?.toLowerCase().includes(searchText) || entryValue?.includes(searchText) || (entryComment != undefined && entryComment.textContent?.includes(searchText))) {
        const id = e.getAttribute("id");
        if (id != null) {
          ids.push(id);
        }
      }
    });

    return ids;
  }

  public static getDesignerText(document: TextDocument, accessabilityType: AccessabilityType) {
    const xmlDoc = this.getDocumentAsXml(document);
    let entries = Array.from(xmlDoc.getElementsByTagName("data"));
    let text: string[] = ["\n"];

    entries.forEach((e) => {
      const entryComment = e.getElementsByTagName("comment")[0];
      const name = e.getAttribute("name");

      if (entryComment != undefined) {
        text.push(`\t\t/// <summary>`);
        text.push(`\t\t/// ${entryComment.textContent}`);
        text.push(`\t\t/// </summary>`);
      }

      text.push(`\t\t${AccessabilityTypeMapper.MapToText(accessabilityType)} static string ${name} => ResourceManager.GetString("${name}", resourceCulture);`);
      text.push("");
    });

    text.push("\t}");
    text.push("}");

    return text.join("\n");
  }

  public static addIdsToAlreadyExistingEntries(document: TextDocument): string {
    const xmlDoc = this.getDocumentAsXml(document);
    let entries = Array.from(xmlDoc.getElementsByTagName("data"));

    entries.forEach((e) => {
      const id = e.getAttribute("id");

      if (id == null || id == "") {
        e.setAttribute("id", crypto.randomUUID());
      }
    });

    const serializer = new XMLSerializer();
    return serializer.serializeToString(xmlDoc);
  }

  public static checkAccessability(document: TextDocument): AccessabilityType | null {
    const xmlDoc = this.getDocumentAsXml(document);
    const nodes = xmlDoc.getElementsByTagName("accessability");

    if (nodes.length === 0 || !nodes[0].textContent) {
      return null;
    }

    return AccessabilityTypeMapper.MapToType(nodes[0].textContent);
  }

  public static createAccessability(document: string, type: AccessabilityType): string {
    var parser = new DOMParser();

    const xmlDoc = parser.parseFromString(document);
    const nodes = xmlDoc.getElementsByTagName("accessability");

    if (nodes.length === 0 || !nodes[0].textContent) {
      let node = xmlDoc.createElement("accessability");
      node.textContent = AccessabilityTypeMapper.MapToText(type);
      const root = xmlDoc.documentElement;
      root.insertBefore(node, root.firstChild);
    } else {
      nodes[0].textContent = AccessabilityTypeMapper.MapToText(type);
    }

    const serializer = new XMLSerializer();
    return serializer.serializeToString(xmlDoc);
  }

  private static getDocumentAsXml(document: TextDocument): XMLDocument {
    var parser = new DOMParser();
    return parser.parseFromString(document.getText());
  }
}
