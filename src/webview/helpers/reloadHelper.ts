import { CreateEditableCell, CreateHeaderCell } from "../components/tableCell";
import { CreateDeleteButton } from "../components/deleteButton";
import { DesignerSelect } from "../components/designerSelect";
import { CellType } from "../../shared/eventArgs/entry/cellType";
import { vscode } from "../../shared/constants/constants";
import { DOMParser } from "@xmldom/xmldom";

export class ReloadHelper {
  public static Reload(text: string) {
    const resourceTable = document.getElementById("resource-table");

    if (resourceTable) {
      const designerSelect = new DesignerSelect();

      this.ResetTable();
      designerSelect.InitializeDesignerSelect();

      const parser = new DOMParser();

      let xmlDoc = parser.parseFromString(text, "text/xml");
      let rows = xmlDoc.getElementsByTagName("data");

      for (let i = 0; i < rows.length; i++) {
        const id = rows[i].getAttribute("id");
        const name = rows[i].getAttribute("name") ?? "";
        const value = rows[i].getElementsByTagName("value")[0]?.textContent ?? "";
        const comment = rows[i].getElementsByTagName("comment")[0]?.textContent ?? "";
        const rowElement = document.createElement("tr");

        if (id === null) {
          vscode.window.showWarningMessage(`File is broken. Name in entry not defined.`);
          throw new Error(`File is broken. Name in entry not defined.`);
        }

        rowElement.id = id;
        rowElement.className = "table-row";
        rowElement.appendChild(CreateEditableCell(id, rows[i > 0 ? i - 1 : i].id, rows[i < rows.length - 1 ? i + 1 : i].id, name, CellType.Name));
        rowElement.appendChild(CreateEditableCell(id, rows[i > 0 ? i - 1 : i].id, rows[i < rows.length - 1 ? i + 1 : i].id, value, CellType.Value));
        rowElement.appendChild(CreateEditableCell(id, rows[i > 0 ? i - 1 : i].id, rows[i < rows.length - 1 ? i + 1 : i].id, comment, CellType.Comment));
        rowElement.appendChild(CreateDeleteButton(id));
        resourceTable?.appendChild(rowElement);
      }
    }
  }

  private static ResetTable() {
    const resourceTable = document.getElementById("resource-table");

    if (resourceTable) {
      resourceTable.innerHTML = "";
    }

    const header = document.createElement("tr");
    header.className = "table-header";
    header.appendChild(CreateHeaderCell("Name"));
    header.appendChild(CreateHeaderCell("Value"));
    header.appendChild(CreateHeaderCell("Comment"));

    resourceTable?.appendChild(header);
  }
}
