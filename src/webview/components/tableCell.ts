import { addChangeEvent } from "../events/entry/entryCellChangeEvent";
import { addKeydownEvent } from "../events/entry/entryCellKeyDownEvent";
import { CellType } from "../../shared/eventArgs/entry/cellType";
import { UpdateEntryEventArgs } from "../../shared/eventArgs/entry/updateEntryEventArgs";
import { DeleteEntryEventArgs } from "../../shared/eventArgs/entry/deleteEntryEventArgs";

export function CreateEditableCell(id: string, beforeId: string, afterId: string, textContent: string, cellType: CellType) {
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

export function UpdateSingleEntry(args: UpdateEntryEventArgs) {
  const selector = `input[data-entry-id="${args.id}"][data-cell-type="${args.cellType}"]`;
  const input = document.querySelector<HTMLInputElement>(selector);

  if (input) {
    const cursorPosition = input.selectionStart;
    input.value = args.newValue.replaceAll(" ", "_");
    input.setSelectionRange(cursorPosition, cursorPosition);
  }
}

export function RemoveEntry(args: DeleteEntryEventArgs) {
  const selector = `tr[id="${args.id}"]`;
  const row = document.querySelector<HTMLTableRowElement>(selector);
  row?.remove();
}

export function FocusCell(id: string, cellType: CellType) {
  const row = document.getElementById(id);
  const cell = row?.querySelector(`textarea[data-cell-type="${cellType.toString()}"]`) as HTMLTextAreaElement;
  cell?.focus();
}

export function CreateHeaderCell(name: string) {
  const cell = document.createElement("th");
  cell.textContent = name;

  return cell;
}
