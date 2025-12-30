import { ViewType } from "../../../../shared/helpers/viewType/viewType";
import { Uri } from "vscode";
import { ComponentIds } from "../../../../shared/constants/componentIds";

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
              <textarea id="${ComponentIds.PlainTextArea}" class="plain-body">${text}</textarea>
              <div class="bottom-bar">
                <button id="${ComponentIds.ChangeViewTypeButton}">Table</button>
              </div>
              <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>`;
  }

  private static GetEditorBody(nonce: string, scriptUri: Uri): string {
    return /* html */ `
            <body>
                <div class="toolbar">
                  <select id="${ComponentIds.DesignerSelect}" name="designer-accessability" class="designer-accessability"></select>
                  <input id="${ComponentIds.Searchbar}" class="searchbar" type="text" placeholder="search...">
                  <button id="${ComponentIds.CreateEntryButton}" class="create-button">New Entry</button>
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
                <div class="bottom-bar">
                  <button id="${ComponentIds.ChangeViewTypeButton}">XML</button>
                </div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>`;
  }
}
