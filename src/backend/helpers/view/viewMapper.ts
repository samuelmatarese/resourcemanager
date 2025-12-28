import { ViewType } from "./viewType";
import { Uri } from "vscode";

export class ViewTypeMapper {
  public static MapToHtmlBody(type: ViewType, scriptUri: Uri, nonce: string, text: string): string {
    switch (type) {
      case ViewType.Plain:
        return this.GetPlainBody(nonce, scriptUri, text);
      case ViewType.Editor:
        return this.GetEditorBody(nonce, scriptUri);
    }
  }

  private static GetPlainBody(nonce: string, scriptUri: Uri, text: string): string {
    return /* html */ `
            <body>
                <textarea class="plain-body">${text}</textarea>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>`;
  }

  private static GetEditorBody(nonce: string, scriptUri: Uri): string {
    return /* html */ `
            <body>
                <div class="toolbar">
                  <select name="designer-accessability" class="designer-accessability"></select>
                  <input id="searchbar" class="searchbar" type="text" placeholder="search...">
                  <button class="create-button">New Entry</button>
                </div>
                <div class="table-wrapper">
                  <table id="resource-table" class="resource-table">
                      <tr class="table-header">
                          <th>Name</th>
                          <th>Value</th>
                          <th>Comment</th>
                      </tr>
                  </table>
                </div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>`;
  }
}
