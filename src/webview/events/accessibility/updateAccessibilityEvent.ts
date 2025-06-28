import { UpdateAccessibilityEventArgs } from "./updateAccessibilityEventArgs";
import { vscode } from "../../constants/constants";
import { AccessibilityTypeMapper } from "../../../backend/designer/accessibilityTypeMapper";
import { Routes } from "../../constants/vscodeRoutes";

export const changeEventHandlers = new Map<HTMLSelectElement, EventListener>();

export const addAccessibilityChangeEvent = (element: HTMLSelectElement): void => {
  element.addEventListener("change", (event) => {
    const accessibility = AccessibilityTypeMapper.MapToType((event.target as HTMLSelectElement).value);
    const eventArgs: UpdateAccessibilityEventArgs = {
      accessibilityType: accessibility,
    };

    vscode.postMessage({
      eventArgs: eventArgs,
      type: Routes.UpdateAccessibility,
    });
  });
};
