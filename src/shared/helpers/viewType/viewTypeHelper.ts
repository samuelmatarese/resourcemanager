import { StateHelper } from "../stateHelper";
import { ViewType } from "./viewType";

export class ViewTypeHelper {
  private static _viewTypeName: string = "ViewType";

  public static SetViewType(type: ViewType) {
    StateHelper.SetState(this._viewTypeName, type);
  }

  public static GetViewType(): ViewType {
    try {
      const viewTypeText = StateHelper.GetState(this._viewTypeName);
      const viewType = viewTypeText as ViewType;

      if (viewType) {
        return viewType;
      }

      this.SetViewType(ViewType.Editor);
      return ViewType.Editor;
    } catch {
      return ViewType.Editor;
    }
  }
}
