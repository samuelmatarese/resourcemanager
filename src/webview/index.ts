import { vscode } from "../shared/constants/constants";
import { Routes } from "../shared/constants/vscodeRoutes";
import { addInputEvent } from "./events/searchbar/searchbarInputEvent";
import { addGlobalKeydownEvent } from "./events/window/globalKeydownEvent";
import { ReloadHelper } from "./helpers/reloadHelper";
import { AccessibilityListener } from "./listeners/accessibilityListener";
import { CommonListener } from "./listeners/commonListener";
import { EditorViewListener } from "./listeners/editorViewListener";

// @ts-check
// Script run within the webview itself.
(function () {
  const addButton = document.getElementsByClassName("create-button")[0];
  const searchbar = document.getElementsByClassName("searchbar")[0] as HTMLInputElement;
  const commonListener = new CommonListener();
  const editorViewListener = new EditorViewListener();
  const accessibilityListener = new AccessibilityListener();
  const listenerHandlers = {
    ...commonListener.MapMessageHandlers(),
    ...editorViewListener.MapMessageHandlers(),
    ...accessibilityListener.MapMessageHandlers(),
  };

  addGlobalKeydownEvent();

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

  window.addEventListener("message", (event) => {
    const message = event.data;
    const handler = listenerHandlers[message.type];

    if (!handler) {
      console.warn(`No message handler registered for route: ${message.type}`);
      return;
    }

    handler(message);
  });

  const state = vscode.getState();
  if (state) {
    ReloadHelper.Reload(state.text);
  }
})();
