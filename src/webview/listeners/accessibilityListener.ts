import { Routes } from "../../shared/constants/vscodeRoutes";
import { MessageHandler } from "./messageHandler";
import { DesignerSelect } from "../components/designerSelect";

export class AccessibilityListener {
  private _handlers: Record<string, MessageHandler> = {
    [Routes.UpdateAccessibility]: this.HandleUpdateAccessibility.bind(this),
    [Routes.GetAccessibility]: this.HandleGetAccessibility.bind(this),
  };

  public MapMessageHandlers(): Record<string, MessageHandler> {
    return this._handlers;
  }

  private HandleGetAccessibility(args: any) {
    const designerSelect = new DesignerSelect();
    designerSelect.GetAccessibility(args.eventArgs);
  }

  private HandleUpdateAccessibility(args: any) {
    const designerSelect = new DesignerSelect();
    designerSelect.UpdateAccessibility(args.eventArgs);
  }
}
