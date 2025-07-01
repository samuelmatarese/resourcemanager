import { CellType } from "./cellType";
import { UpdateEntryEventArgs } from "./events/entry/updateEntryEventArgs";
import { vscode } from "./constants/constants";
import { Routes } from "./constants/vscodeRoutes";
import { addChangeEvent, removeChangeEvent } from "./events/entry/entryCellChangeEvent";
import { addInputEvent } from "./events/searchbar/searchbarInputEvent";
import { AccessibilityTypeMapper } from "../backend/designer/accessibilityTypeMapper";
import { UpdateAccessibilityEventArgs } from "./events/accessibility/updateAccessibilityEventArgs";
import { GetAccessibilityEventArgs } from "./events/accessibility/getAccessibilityEventArgs";
import { addAccessibilityChangeEvent } from "./events/accessibility/updateAccessibilityEvent";
import { addKeydownEvent } from "./events/entry/entryCellKeyDownEvent";

// @ts-check
// Script run within the webview itself.
(function () {
  const resourceTable = document.getElementById("resource-table");
  const addButton = document.getElementsByClassName("create-button")[0];
  const searchbar = document.getElementsByClassName("searchbar")[0] as HTMLInputElement;
  const designerSelect = document.getElementsByClassName("designer-accessability")[0] as HTMLSelectElement;

  if (addButton === null) {
    throw new Error("addbutton is null");
  }

  if (searchbar === null) {
    throw new Error("searchbar is null");
  }

  addButton.addEventListener("click", () => {
    vscode.postMessage({
      type: Routes.AddEntry,
    });
  });

  addInputEvent(searchbar);

  const errorContainer = document.createElement("div");
  document.body.appendChild(errorContainer);
  errorContainer.className = "error";
  errorContainer.classList.add("hidden");

  function updateContent(text: string) {
    console.log("update webview");
    const resourceTable = document.getElementById("resource-table");
    resetTable();
    createDesignerSelect();

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
      rowElement.appendChild(createEditableCell(id, rows[i > 0 ? i - 1 : i].id, rows[i < rows.length - 1 ? i + 1 : i].id, name, CellType.Name));
      rowElement.appendChild(createEditableCell(id, rows[i > 0 ? i - 1 : i].id, rows[i < rows.length - 1 ? i + 1 : i].id, value, CellType.Value));
      rowElement.appendChild(createEditableCell(id, rows[i > 0 ? i - 1 : i].id, rows[i < rows.length - 1 ? i + 1 : i].id, comment, CellType.Comment));
      rowElement.appendChild(createDeleteButton(id));
      resourceTable?.appendChild(rowElement);
    }
  }

  function createDeleteButton(id: string) {
    const button = document.createElement("button");
    const icon = document.createElement("span");

    icon.className = "material-symbols-outlined";
    icon.textContent = "X";
    button.className = "delete-button";
    button.appendChild(icon);

    button.addEventListener("click", () => {
      vscode.postMessage({
        id: id,
        type: Routes.DeleteEntry,
      });
    });

    return button;
  }

  function createEditableCell(id: string, beforeId: string, afterId: string, textContent: string, cellType: CellType) {
    const cell = document.createElement("td");
    const textarea = document.createElement("textarea");

    textarea.value = textContent;
    textarea.rows = 1;
    textarea.dataset.entryId = id;
    textarea.dataset.cellType = cellType.toString();
    addChangeEvent(textarea, cellType, id);
    addKeydownEvent(textarea, beforeId, afterId, id, cellType);

    cell.appendChild(textarea);
    return cell;
  }

  function createDesignerSelect() {
    designerSelect.innerHTML = "";
    const types = AccessibilityTypeMapper.GetAll();

    types.forEach((t) => {
      const option = document.createElement("option");
      option.value = t.toString();
      option.textContent = AccessibilityTypeMapper.MapToText(t);
      designerSelect.appendChild(option);
    });

    addAccessibilityChangeEvent(designerSelect);

    vscode.postMessage({
      type: Routes.GetAccessibility,
    });
  }

  function resetTable() {
    if (resourceTable) {
      resourceTable.innerHTML = "";
    }

    const header = document.createElement("tr");
    header.className = "table-header";
    header.appendChild(createHeaderCell("Name"));
    header.appendChild(createHeaderCell("Value"));
    header.appendChild(createHeaderCell("Comment"));

    resourceTable?.appendChild(header);
  }

  function createHeaderCell(name: string) {
    const cell = document.createElement("th");
    cell.textContent = name;

    return cell;
  }

  window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.type) {
      case Routes.UpdateAllRoute:
        updateContent(message.text);
        vscode.setState({ text: message.text});
        return;

      case Routes.UpdateSingleEntryRoute:
        updateSingleEntry(message.eventArgs);
        vscode.setState({text: message.text});
        return;

      case Routes.SearchRoute:
        filterEntries(message.ids);
        return;

      case Routes.UpdateAccessibility:
        updateAccessability(message.eventArgs);
        return;

      case Routes.GetAccessibility:
        getAccessability(message.eventArgs);
        return;
    }
  });

  function updateSingleEntry(args: UpdateEntryEventArgs) {
    const selector = `input[data-entry-id="${args.id}"][data-cell-type="${args.cellType}"]`;
    const input = document.querySelector<HTMLInputElement>(selector);

    if (input) {
      const cursorPosition = input.selectionStart;
      input.value = args.newValue.replaceAll(" ", "_");
      input.setSelectionRange(cursorPosition, cursorPosition);
    }
  }

  function updateAccessability(args: UpdateAccessibilityEventArgs) {
    designerSelect.value = args.accessibilityType.toString();
  }

  function getAccessability(args: GetAccessibilityEventArgs) {
    designerSelect.value = args.accessibilityType.toString();
  }

  function filterEntries(ids: string[]) {
    let entries = Array.from(document.getElementsByClassName("table-row"));

    entries.forEach((entry) => {
      if (!(entry instanceof HTMLElement)) {
        return;
      }

      if (!ids.includes(entry.id)) {
        entry.classList.add("hidden");
      } else {
        entry.classList.remove("hidden");
      }
    });
  }

  const state = vscode.getState();
  if (state) {
    updateContent(state.text);
  }
})();
