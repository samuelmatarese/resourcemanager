import { CellType } from "./cellType";
import { UpdateEntryEventArgs } from "./updateEntryEventArgs";
import { vscode } from "./constants/constants";
import {
  addChangeEvent,
  removeChangeEvent,
} from "./events/entryCellChangeEvent";

// @ts-check
// Script run within the webview itself.
(function () {
  const resourceTable = document.getElementById("resource-table");
  const addButton = document.getElementsByClassName("create-button")[0];

  if (addButton == null) {
    throw new Error("addbutton is null");
  }

  addButton.addEventListener("click", () => {
    vscode.postMessage({
      type: "add",
    });
  });

  const errorContainer = document.createElement("div");
  document.body.appendChild(errorContainer);
  errorContainer.className = "error";
  errorContainer.style.display = "none";

  function updateContent(text: string) {
    const resourceTable = document.getElementById("resource-table");
    resetTable();

    const parser = new DOMParser();
    let xmlDoc = parser.parseFromString(text, "text/xml");
    let rows = xmlDoc.getElementsByTagName("data");

    for (let i = 0; i < rows.length; i++) {
      const id = rows[i].getAttribute("id");
      const name = rows[i].getAttribute("name") ?? "";
      const value = rows[i].getElementsByTagName("value")[0]?.textContent ?? "";
      const comment = rows[i].getElementsByTagName("comment")[0]?.textContent ?? "";
      const rowElement = document.createElement("tr");

      if (id == null) {
        vscode.window.showWarningMessage(
          `File is broken. Name in entry not defined.`
        );
        throw new Error(`File is broken. Name in entry not defined.`);
      }

      rowElement.appendChild(createEditableCell(id, name, CellType.Name));
      rowElement.appendChild(createEditableCell(id, value, CellType.Value));
      rowElement.appendChild(createEditableCell(id, comment, CellType.Comment));
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
        type: "delete",
      });
    });

    return button;
  }

  function createEditableCell(
    id: string,
    textContent: string,
    cellType: CellType
  ) {
    const cell = document.createElement("td");
    const input = document.createElement("input");

    input.value = textContent;
    input.dataset.entryId = id;
    input.dataset.cellType = cellType.toString();
    addChangeEvent(input, cellType, id);

    cell.appendChild(input);
    return cell;
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
      case "update":
        const text = message.text;
        updateContent(text);
        vscode.setState({ text });
        return;

      case "updateSingle":
        updateSingleEntry(message.eventArgs);
        return;
    }
  });

  function updateSingleEntry(args: UpdateEntryEventArgs) {
    const selector = `input[data-entry-id="${args.id}"][data-cell-type="${args.cellType}"]`;
    const input = document.querySelector<HTMLInputElement>(selector);

    if (input) {
      const cursorPosition = input.selectionStart;
      input.value = args.newValue;
      input.setSelectionRange(cursorPosition, cursorPosition);
    }
  }

  function updateIdInChildsAndEvents(id: string) {
    const selector = `input[data-entry-id="${id}"]`;

    let elements = Array.from(
      document.querySelectorAll<HTMLInputElement>(selector)
    );

    elements.forEach((e) => {
      removeChangeEvent(e);
      const type = CellType[e.dataset.cellType as keyof typeof CellType];
      e.dataset.id = id;
      addChangeEvent(e, type, id);
    });
  }

  // Webviews are normally torn down when not visible and re-created when they become visible again.
  // State lets us save information across these re-loads
  const state = vscode.getState();
  if (state) {
    updateContent(state.text);
  }
})();
