import { ExtensionContextProvider } from "./extensionContextProvider";

export class StateHelper {
  private static _statePrefix = "Resx_Manager_";

  public static SetState(name: string, value: string) {
    const context = ExtensionContextProvider.Get();
    context.globalState.update(this._statePrefix + name, value);
  }

  public static GetState(name: string): string {
    const context = ExtensionContextProvider.Get();
    return context.globalState.get(this._statePrefix + name) ?? "";
  }
}
