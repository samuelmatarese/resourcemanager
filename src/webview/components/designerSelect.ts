import { AccessibilityTypeMapper } from "../../shared/eventArgs/accessibility/accessibilityTypeMapper";
import { addAccessibilityChangeEvent } from "../events/accessibility/updateAccessibilityEvent";
import { vscode } from "../../shared/constants/constants";
import { Routes } from "../../shared/constants/vscodeRoutes";
import { UpdateAccessibilityEventArgs } from "../../shared/eventArgs/accessibility/updateAccessibilityEventArgs";
import { GetAccessibilityEventArgs } from "../../shared/eventArgs/accessibility/getAccessibilityEventArgs";

export class DesignerSelect {
  constructor(private designerSelect: HTMLSelectElement = document.getElementsByClassName("designer-accessability")[0] as HTMLSelectElement) 
  {}

  public InitializeDesignerSelect() {
    this.designerSelect.innerHTML = "";
    const types = AccessibilityTypeMapper.GetAll();

    types.forEach((t) => {
      const option = document.createElement("option");
      option.value = t.toString();
      option.textContent = AccessibilityTypeMapper.MapToText(t);
      this.designerSelect.appendChild(option);
    });

    addAccessibilityChangeEvent(this.designerSelect);

    vscode.postMessage({
      type: Routes.GetAccessibility,
    });
  }

  public UpdateAccessibility(args: UpdateAccessibilityEventArgs) {
    this.designerSelect.value = args.accessibilityType.toString();
  }

  public GetAccessibility(args: GetAccessibilityEventArgs) {
    this.designerSelect.value = args.accessibilityType.toString();
  }
}
