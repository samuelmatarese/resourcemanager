import { vscode } from "../../../shared/constants/constants";
import { Routes } from "../../../shared/constants/vscodeRoutes";
import { UpdateViewTypeEventArgs } from "../../../shared/eventArgs/webView/updateViewTypeEventArgs";

export const inputEventHandlers = new Map<HTMLButtonElement, EventListener>();

export const AddChangeViewTypeEvent = (changeViewTypeButton: HTMLButtonElement): void => {
  changeViewTypeButton.addEventListener("click", (event) => {
    const args: UpdateViewTypeEventArgs = {
      ChangeViewType: true,
    };

    vscode.postMessage({
      eventArgs: args,
      type: Routes.UpdateWebView,
    });
  });
};
