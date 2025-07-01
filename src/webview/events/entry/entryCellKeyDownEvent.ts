import { CellType } from "../../cellType";
import { vscode } from "../../constants/constants";
import { Routes } from "../../constants/vscodeRoutes";

export const keydownEventHandlers = new Map<HTMLTextAreaElement, EventListener>();

export const addKeydownEvent = (element: HTMLTextAreaElement, beforeId: string, afterId: string, id: string, cellType: CellType): void => {
  removeKeyDownEvent(element);

  element.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "d") {
      vscode.postMessage({
        id: id,
        type: Routes.DeleteEntry,
      });
    }

    if (event.ctrlKey && event.key === "ArrowDown") {
      const row = document.getElementById(afterId);
      const cell = row?.querySelector(`textarea[data-cell-type="${cellType.toString()}"]`) as HTMLTextAreaElement;
      cell?.focus();
    }

    if (event.ctrlKey && event.key === "ArrowUp") {
      const row = document.getElementById(beforeId);
      const cell = row?.querySelector(`textarea[data-cell-type="${cellType.toString()}"]`) as HTMLTextAreaElement;
      cell?.focus();
    }
  });
};

export const removeKeyDownEvent = (element: HTMLTextAreaElement): void => {
  const handler = keydownEventHandlers.get(element);
  if (handler) {
    element.removeEventListener("keydown", handler);
    keydownEventHandlers.delete(element);
  }
};
