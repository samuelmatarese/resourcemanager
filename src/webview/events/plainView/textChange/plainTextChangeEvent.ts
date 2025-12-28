import { UpdatePlainTextEventArgs } from "./updatePlainTextEventArgs";
import { vscode } from "../../../constants/constants";
import { Routes } from "../../../../shared/vscodeRoutes";

export const changeEventHandlers = new Map<HTMLTextAreaElement, EventListener>();

export const addPlainTextChangeEvent = (
  element: HTMLTextAreaElement,
): void => {
  element.addEventListener("input", (event) => {
    const newValue = (event.target as HTMLTextAreaElement).value;
    const eventArgs: UpdatePlainTextEventArgs = {
      newValue: newValue
    };

    vscode.postMessage({
      eventArgs: eventArgs,
      type: Routes.EditEntry,
    });
  });
};

export const removePlainTextChangeEvent = (element: HTMLTextAreaElement): void => {
  const handler = changeEventHandlers.get(element);
  if (handler) {
    element.removeEventListener("input", handler);
    changeEventHandlers.delete(element);
  }
};