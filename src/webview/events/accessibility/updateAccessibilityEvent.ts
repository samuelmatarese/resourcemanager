import { UpdateAccessibilityEventArgs } from "../../../shared/eventArgs/accessibility/updateAccessibilityEventArgs";
import { vscode } from "../../../shared/constants/constants";
import { AccessibilityTypeMapper } from "../../../shared/eventArgs/accessibility/accessibilityTypeMapper";
import { Routes } from "../../../shared/constants/vscodeRoutes";

export const changeEventHandlers = new Map<HTMLSelectElement, EventListener>();

export const addAccessibilityChangeEvent = (element: HTMLSelectElement): void => {
  const existingHandler = changeEventHandlers.get(element);
  if (existingHandler) {
    element.removeEventListener("change", existingHandler);
  }

  const handler = (event: Event) => {
    const accessibility = AccessibilityTypeMapper.MapToType((event.target as HTMLSelectElement).value);
    const eventArgs: UpdateAccessibilityEventArgs = {
      accessibilityType: accessibility,
    };

    vscode.postMessage({
      eventArgs: eventArgs,
      type: Routes.UpdateAccessibility,
    });
  };

  element.addEventListener("change", handler);
  changeEventHandlers.set(element, handler);
};
