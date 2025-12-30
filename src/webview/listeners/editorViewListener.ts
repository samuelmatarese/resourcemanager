import { MessageHandler } from "./messageHandler";
import { Routes } from "../../shared/constants/vscodeRoutes";
import { vscode } from "../../shared/constants/constants";
import { CellType } from "../../shared/eventArgs/entry/cellType";
import { ReloadHelper } from "../helpers/reloadHelper";
import { FocusCell } from "../components/tableCell";
import { UpdateSingleEntry } from "../components/tableCell";
import { FilterEntries } from "../components/entryTable";

export class EditorViewListener {
  private _handlers: Record<string, MessageHandler> = {
    [Routes.AddEntry]: this.HandleAddEntry.bind(this),
    [Routes.UpdateSingleEntryRoute]: this.HandleUpdateSingleEntry.bind(this),
    [Routes.SearchRoute]: this.HandleFilterEntries.bind(this),
  };

  public MapMessageHandlers(): Record<string, MessageHandler> {
    return this._handlers;
  }

  private HandleAddEntry(args: any) {
    ReloadHelper.Reload(args.text);
    vscode.setState({ text: args.text });
    FocusCell(args.id, CellType.Name);
  }

  private HandleUpdateSingleEntry(args: any) {
    UpdateSingleEntry(args.eventArgs);
    vscode.setState({ text: args.text });
  }

  private HandleFilterEntries(args: any) {
    FilterEntries(args.ids);
  }
}
