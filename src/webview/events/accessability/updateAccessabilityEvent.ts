import { UpdateAccessabilityEventArgs } from "./updateAccessabilityEventArgs";
import { vscode } from "../../constants/constants";
import { AccessabilityTypeMapper } from "../../../backend/designer/accessabilityTypeMapper";
import { Routes } from "../../constants/vscodeRoutes";

export const changeEventHandlers = new Map<HTMLSelectElement, EventListener>();

export const addAccessabilityChangeEvent = (element: HTMLSelectElement): void => {
  element.addEventListener("change", (event) => {
    const accessability = AccessabilityTypeMapper.MapToType((event.target as HTMLSelectElement).value);
    const eventArgs: UpdateAccessabilityEventArgs = {
      accessabilityType: accessability,
    };

    vscode.postMessage({
      eventArgs: eventArgs,
      type: Routes.UpdateAccessability,
    });
  });
};
