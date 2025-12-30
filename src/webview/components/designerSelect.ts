import { AccessibilityTypeMapper } from "../../shared/eventArgs/accessibility/accessibilityTypeMapper";
import { addAccessibilityChangeEvent } from "../events/accessibility/updateAccessibilityEvent";
import { vscode } from "../../shared/constants/constants";
import { Routes } from "../../shared/constants/vscodeRoutes";
import { UpdateAccessibilityEventArgs } from "../../shared/eventArgs/accessibility/updateAccessibilityEventArgs";
import { GetAccessibilityEventArgs } from "../../shared/eventArgs/accessibility/getAccessibilityEventArgs";
import { ComponentIds } from "../../shared/constants/componentIds";

export class DesignerSelect {
  constructor(private designerSelect: HTMLSelectElement = document.getElementById(ComponentIds.DesignerSelect) as HTMLSelectElement) {}

  public InitializeDesignerSelect() {
    if (this.designerSelect) {
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
  }

  public UpdateAccessibility(args: UpdateAccessibilityEventArgs) {
    if (this.designerSelect) {
      this.designerSelect.value = args.accessibilityType.toString();
    }
  }

  public GetAccessibility(args: GetAccessibilityEventArgs) {
    if (this.designerSelect) {
      this.designerSelect.value = args.accessibilityType.toString();
    }
  }
}
