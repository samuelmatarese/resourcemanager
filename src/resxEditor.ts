import * as vscode from "vscode";
import { getNonce } from "./util";
import { XMLSerializer, DOMParser } from "xmldom";
import { UpdateEntryEventArgs } from "./webview/updateEntryEventArgs";
import { CellType } from "./webview/cellType";
import { UpdateType } from "./updateType";

export class ResourceEditorProvider implements vscode.CustomTextEditorProvider {
  private _updateWebViewType = UpdateType.None;
  private _updateEntryEventArgs: UpdateEntryEventArgs | undefined = undefined;

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new ResourceEditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(
      ResourceEditorProvider.viewType,
      provider
    );
    return providerRegistration;
  }

  private static readonly viewType = "resource.resx";

  constructor(private readonly context: vscode.ExtensionContext) {}

  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    // Setup initial content for the webview
    webviewPanel.webview.options = {
      enableScripts: true,
    };
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    function updateWebview() {
      webviewPanel.webview.postMessage({
        type: "update",
        text: document.getText(),
      });
    }

    function singleUpdateWebview(args: UpdateEntryEventArgs) {
      webviewPanel.webview.postMessage({
        type: "updateSingle",
        eventArgs: {
          id: args.id,
          newValue: args.newValue,
          cellType: args.cellType,
        },
      });
    }

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(
      (e) => {
        if (
          e.document.uri.toString() === document.uri.toString() &&
          this._updateWebViewType == UpdateType.Full
        ) {
          updateWebview();
        } else if (
          e.document.uri.toString() === document.uri.toString() &&
          this._updateWebViewType == UpdateType.Single &&
          this._updateEntryEventArgs != undefined
        ) {
          singleUpdateWebview(this._updateEntryEventArgs);
          this._updateEntryEventArgs = undefined;
        }

        this._updateWebViewType = UpdateType.None;
      }
    );

    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
    });

    webviewPanel.webview.onDidReceiveMessage((e) => {
      switch (e.type) {
        case "add":
          this._updateWebViewType = UpdateType.Full;
          this.addEntry(document);
          return;

        case "editEntry":
          this._updateWebViewType = UpdateType.Single;
          this.editEntry(document, e.eventArgs);
          singleUpdateWebview(e.eventArgs);
          return;

        case "delete":
          this._updateWebViewType = UpdateType.Full;
          this.deleteEntry(document, e.id);
          return;
      }
    });
  }

  private addEntry(document: vscode.TextDocument) {
    return this.insertDefaultResource(document);
  }

  private deleteEntry(document: vscode.TextDocument, id: string) {
    return this.removeEntry(document, id);
  }

  private getDocumentAsXml(document: vscode.TextDocument): XMLDocument {
    var parser = new DOMParser();
    return parser.parseFromString(document.getText());
  }

  private insertDefaultResource(document: vscode.TextDocument) {
    const edit = new vscode.WorkspaceEdit();
    const xmlText = document.getText();
    const rootCloseTag = "</root>";
    const insertOffset = xmlText.lastIndexOf(rootCloseTag);

    if (insertOffset === -1) {
      vscode.window.showErrorMessage("No  </root>-Tag found.");
      return;
    }

    edit.insert(
      document.uri,
      document.positionAt(insertOffset),
      this.generateFormattedDataXml() + "\n"
    );

    return vscode.workspace.applyEdit(edit);
  }

  private removeEntry(document: vscode.TextDocument, id: string) {
    const edit = new vscode.WorkspaceEdit();
    const text = document.getText();

    const regex = new RegExp(
      `<data[^>]*id="${id}"[^>]*>[\\s\\S]*?<\\/data>`,
      "g"
    );
    const match = regex.exec(text);

    if (match && match.index !== undefined) {
      const startPos = document.positionAt(match.index);
      const endPos = document.positionAt(match.index + match[0].length);
      const range = new vscode.Range(startPos, endPos);

      edit.delete(document.uri, range);
      return vscode.workspace.applyEdit(edit);
    } else {
      vscode.window.showWarningMessage(`No entry with id="${id}" found.`);
      return;
    }
  }

  private editEntry(document: vscode.TextDocument, args: UpdateEntryEventArgs) {
    const edit = new vscode.WorkspaceEdit();
    const xmlDoc = this.getDocumentAsXml(document);

    let entries = xmlDoc.getElementsByTagName("data");
    let entry = this.findEntryByName(args.id, entries);

    switch (args.cellType) {
      case CellType.Name:
        entry.setAttribute("name", args.newValue);
        break;

      case CellType.Value:
        let entryValue = entry.getElementsByTagName("value")[0];
        entryValue.textContent = args.newValue;
        break;

      case CellType.Comment:
        let entryComment = entry.getElementsByTagName("comment")[0];
        entryComment.textContent = args.newValue;
        break;
    }

    this._updateEntryEventArgs = {
      cellType: args.cellType,
      id: args.id,
      newValue: args.newValue
    }

    const serializer = new XMLSerializer();
    const newText = serializer.serializeToString(xmlDoc);

    const fullRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(document.getText().length)
    );

    edit.replace(document.uri, fullRange, newText);
    vscode.workspace.applyEdit(edit);
  }

  private generateFormattedDataXml(
    name: string = "new entry",
    value: string = "",
    comment: string = ""
  ): string {
    return `<data id="${crypto.randomUUID()}" name="${name}" xml:space="preserve">\n\t<value>${value}</value>\n\t<comment>${comment}</comment>\n</data>`;
  }

  private findEntryByName(
    id: string,
    entries: HTMLCollectionOf<HTMLDataElement>
  ): HTMLDataElement {
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].getAttribute("id") == id) {
        return entries[i];
      }
    }

    throw new Error("No entry found with id: " + id);
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    // Local path to script and css for the webview
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "out",
        "webview",
        "webview.js"
      )
    );

    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", "reset.css")
    );

    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", "vscode.css")
    );

    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "media",
        "resourceEditor.css"
      )
    );

    // Use a nonce to whitelist which scripts can be run
    const nonce = getNonce();

    return /* html */ `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">

                <!--
                Use a content security policy to only allow loading images from https or from our extension directory,
                and only allow scripts that have a specific nonce.
                -->
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

                <meta name="viewport" content="width=device-width, initial-scale=1.0">

                <link href="${styleResetUri}" rel="stylesheet" />
                <link href="${styleVSCodeUri}" rel="stylesheet" />
                <link href="${styleMainUri}" rel="stylesheet" />

                <title>Resource Manager</title>
            </head>
            <body>
                <div class="toolbar">
                  <input class="searchbar" type="text" placeholder="search...">
                  <button class="create-button">New Entry</button>
                </div>
                <div class="table-wrapper">
                  <table id="resource-table" class="resource-table">
                      <tr class="table-header">
                          <th>Identifier</th>
                          <th>Value</th>
                          <th>Comment</th>
                      </tr>
                  </table>
                </div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
  }
}
