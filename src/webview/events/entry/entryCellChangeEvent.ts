import { UpdateEntryEventArgs } from "../../../shared/eventArgs/entry/updateEntryEventArgs";
import { CellType } from "../../../shared/eventArgs/entry/cellType";
import { vscode } from "../../../shared/constants/constants";
import { Routes } from "../../../shared/constants/vscodeRoutes";

export const changeEventHandlers = new Map<HTMLTextAreaElement, EventListener>();

export const addChangeEvent = (
  element: HTMLTextAreaElement,
  cellType: CellType,
  id: string
): void => {
  element.addEventListener("input", (event) => {
    const newValue = (event.target as HTMLTextAreaElement).value;
    const eventArgs: UpdateEntryEventArgs = {
      id: id,
      newValue: newValue,
      cellType: cellType,
    };

    vscode.postMessage({
      eventArgs: eventArgs,
      type: Routes.EditEntry,
    });
  });
};

export const removeChangeEvent = (element: HTMLTextAreaElement): void => {
  const handler = changeEventHandlers.get(element);
  if (handler) {
    element.removeEventListener("input", handler);
    changeEventHandlers.delete(element);
  }
};
