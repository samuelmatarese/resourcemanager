import { CellType } from "../../cellType";
import { vscode } from "../../constants/constants";
import { Routes } from "../../constants/vscodeRoutes";

export const globalKeydownEventHandlers = new Map<Window, EventListener>();

export const addGlobalKeydownEvent = (): void => {
  removeKeyDownEvent(window);

  window.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "f") {
      const searchbar = document.getElementById("searchbar");
      searchbar?.focus();
    }

    if (event.ctrlKey && event.key === " ") {
      vscode.postMessage({
        type: Routes.AddEntry,
      });
    }
  });
};

export const removeKeyDownEvent = (element: Window): void => {
  const handler = globalKeydownEventHandlers.get(element);
  if (handler) {
    element.removeEventListener("keydown", handler);
    globalKeydownEventHandlers.delete(element);
  }
};
