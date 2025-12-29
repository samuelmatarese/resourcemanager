import { Routes } from "../../shared/constants/vscodeRoutes";
import { MessageHandler } from "./messageHandler";
import { ReloadHelper } from "../helpers/reloadHelper";
import { vscode } from "../../shared/constants/constants";

export class CommonListener {
  private _handlers: Record<string, MessageHandler> = {
    [Routes.UpdateAllRoute]: this.HandleUpdateAll.bind(this),
  };

  public MapMessageHandlers(): Record<string, MessageHandler> {
    return this._handlers;
  }

  private HandleUpdateAll(args: any) {
    ReloadHelper.Reload(args.text);
    vscode.setState({ text: args.text });
  }
}
