import { DeleteEntryEventArgs } from "../../shared/eventArgs/entry/deleteEntryEventArgs";
import { vscode } from "../../shared/constants/constants";
import { Routes } from "../../shared/constants/vscodeRoutes";

export function CreateDeleteButton(id: string) {
  const button = document.createElement("button");
  const icon = document.createElement("span");
  const args: DeleteEntryEventArgs = {
    id: id,
  };

  icon.className = "material-symbols-outlined";
  icon.textContent = "X";
  button.className = "delete-button";
  button.appendChild(icon);

  button.addEventListener("click", () => {
    vscode.postMessage({
      eventArgs: args,
      type: Routes.DeleteEntry,
    });
  });

  return button;
}
