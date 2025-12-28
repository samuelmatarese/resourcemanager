import { vscode } from "../../../shared/constants/constants";
import { SearchbarInputEventArgs } from "../../../shared/eventArgs/searchbar/searchbarInputEventArgs";
import { Routes } from "../../../shared/constants/vscodeRoutes";

export const inputEventHandlers = new Map<HTMLInputElement, EventListener>();

export const addInputEvent = (searchbar: HTMLInputElement): void => {
  searchbar.addEventListener("input", (event) => {
    const searchText = (event.target as HTMLInputElement).value;
    const eventArgs: SearchbarInputEventArgs = {
      searchText: searchText,
    };

    vscode.postMessage({
      eventArgs: eventArgs,
      type: Routes.SearchRoute,
    });
  });
};
