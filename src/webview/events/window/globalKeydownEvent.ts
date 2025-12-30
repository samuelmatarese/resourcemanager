import { UpdateViewTypeEventArgs } from "../../../shared/eventArgs/webView/updateViewTypeEventArgs";
import { vscode } from "../../../shared/constants/constants";
import { Routes } from "../../../shared/constants/vscodeRoutes";

export const globalKeydownEventHandlers = new Map<Window, EventListener>();

export const addEditorGlobalKeydownEvent = (): void => {
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

export const addCommonGlobalKeydownEvent = (): void => {
  window.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "Enter") {
      const args: UpdateViewTypeEventArgs = {
        ChangeViewType: true,
      };

      vscode.postMessage({
        eventArgs: args,
        type: Routes.UpdateWebView,
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
