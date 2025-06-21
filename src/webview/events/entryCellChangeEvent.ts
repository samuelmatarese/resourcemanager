import { UpdateEntryEventArgs } from "../updateEntryEventArgs";
import { CellType } from "../cellType";
import { vscode } from "../constants/constants";

export const changeEventHandlers = new Map<HTMLInputElement, EventListener>();

export const addChangeEvent = (
  element: HTMLInputElement,
  cellType: CellType,
  id: string
): void => {
  element.addEventListener("change", (event) => {
    const newValue = (event.target as HTMLInputElement).value;
    const eventArgs: UpdateEntryEventArgs = {
      id: id,
      newValue: newValue,
      cellType: cellType,
    };

    vscode.postMessage({
      eventArgs: eventArgs,
      type: "editEntry",
    });
  });
};

export const removeChangeEvent = (element: HTMLInputElement): void => {
  const handler = changeEventHandlers.get(element);
  if (handler) {
    element.removeEventListener("change", handler);
    changeEventHandlers.delete(element); // Aufräumen
  }
};
