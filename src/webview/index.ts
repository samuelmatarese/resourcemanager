import { vscode } from "../shared/constants/constants";
import { Routes } from "../shared/constants/vscodeRoutes";
import { addInputEvent } from "./events/searchbar/searchbarInputEvent";
import { addEditorGlobalKeydownEvent, addCommonGlobalKeydownEvent, removeKeyDownEvent } from "./events/window/globalKeydownEvent";
import { ReloadHelper } from "./helpers/reloadHelper";
import { AccessibilityListener } from "./listeners/accessibilityListener";
import { CommonListener } from "./listeners/commonListener";
import { EditorViewListener } from "./listeners/editorViewListener";
import { AddChangeViewTypeEvent } from "./events/viewType/changeViewTypeEvent";
import { ComponentIds } from "../shared/constants/componentIds";
import { addPlainTextChangeEvent } from "./events/plainView/textChange/plainTextChangeEvent";

// @ts-check
// Script run within the webview itself.
(function () {
  const addButton = document.getElementById(ComponentIds.CreateEntryButton);
  const searchbar = document.getElementById(ComponentIds.Searchbar) as HTMLInputElement;
  const viewTypeChangeButton = document.getElementById(ComponentIds.ChangeViewTypeButton) as HTMLButtonElement;
  const commonListener = new CommonListener();
  const editorViewListener = new EditorViewListener();
  const accessibilityListener = new AccessibilityListener();
  const listenerHandlers = {
    ...commonListener.MapMessageHandlers(),
    ...editorViewListener.MapMessageHandlers(),
    ...accessibilityListener.MapMessageHandlers(),
  };

  removeKeyDownEvent(window);
  
  // Editormode
  if (addButton !== null && searchbar !== null) {
    addEditorGlobalKeydownEvent();

    addButton.addEventListener("click", () => {
      vscode.postMessage({
        type: Routes.AddEntry,
      });
    });

    addInputEvent(searchbar);
  }
  // Plainmode
  else {
    const textArea = document.getElementById(ComponentIds.PlainTextArea) as HTMLTextAreaElement;
    addPlainTextChangeEvent(textArea);
  }

  addCommonGlobalKeydownEvent();
  AddChangeViewTypeEvent(viewTypeChangeButton);

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
