import * as vscode from "vscode";
import { getNonce } from "./util";
import { XMLSerializer, DOMParser } from "xmldom";

/**
 * Provider for cat scratch editors.
 *
 * Cat scratch editors are used for `.cscratch` files, which are just json files.
 * To get started, run this extension and open an empty `.cscratch` file in VS Code.
 *
 * This provider demonstrates:
 *
 * - Setting up the initial webview for a custom editor.
 * - Loading scripts and styles in a custom editor.
 * - Synchronizing changes between a text document and a custom editor.
 */
export class ResourceEditorProvider implements vscode.CustomTextEditorProvider {
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

  /**
   * Called when our custom editor is opened.
   *
   *
   */
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

    // Hook up event handlers so that we can synchronize the webview with the text document.
    //
    // The text document acts as our model, so we have to sync change in the document to our
    // editor and sync changes in the editor back to the document.
    //
    // Remember that a single text document can also be shared between multiple custom
    // editors (this happens for example when you split a custom editor)

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(
      (e) => {
        if (e.document.uri.toString() === document.uri.toString()) {
          updateWebview();
        }
      }
    );

    // Make sure we get rid of the listener when our editor is closed.
    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
    });

    // Receive message from the webview.
    webviewPanel.webview.onDidReceiveMessage((e) => {
      switch (e.type) {
        case "add":
          this.addNewScratch(document);
          return;

        case "delete":
          this.deleteScratch(document, e.id);
          return;
      }
    });

    updateWebview();
  }

  /**
   * Add a new scratch to the current document.
   */
  private addNewScratch(document: vscode.TextDocument) {
    return this.insertDefaultResource(document);
  }

  /**
   * Delete an existing scratch from a document.
   */
  private deleteScratch(document: vscode.TextDocument, id: string) {
    const json = this.getDocumentAsJson(document);
    if (!Array.isArray(json.scratches)) {
      return;
    }

    json.scratches = json.scratches.filter((note: any) => note.id !== id);

    return this.updateTextDocument(document, json);
  }

  /**
   * Try to get a current document as json text.
   */
  private getDocumentAsJson(document: vscode.TextDocument): any {
    const text = document.getText();
    if (text.trim().length === 0) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(
        "Could not get document as json. Content is not valid json"
      );
    }
  }

  private insertDefaultResource(document: vscode.TextDocument) {
    const edit = new vscode.WorkspaceEdit();
    const xmlText = document.getText();
    const rootCloseTag = "</root>";
    const insertOffset = xmlText.lastIndexOf(rootCloseTag);

    if (insertOffset === -1) {
      vscode.window.showErrorMessage("Kein </root>-Tag gefunden.");
      return;
    }

    edit.insert(
      document.uri,
      document.positionAt(insertOffset),
      "\n" + this.generateFormattedDataXml() + "\n"
    );

    return vscode.workspace.applyEdit(edit);
  }

  private updateTextDocument(document: vscode.TextDocument, newElement: Node) {
    const edit = new vscode.WorkspaceEdit();
    const serializer = new XMLSerializer();
    const newXmlElement = serializer.serializeToString(newElement);
    const prettyXml = `  ${newXmlElement.replace(/></g, ">\n  <")}\n`;
    const lastLine = document.lineCount - 1;
    const lastChar = document.lineAt(lastLine).range.end.character;
    const insertPosition = new vscode.Position(lastLine, lastChar);

    edit.insert(document.uri, insertPosition, "\n" + prettyXml + "\n");
    return vscode.workspace.applyEdit(edit);
  }

  private generateFormattedDataXml(
    name: string = "new entry",
    value: string = "",
    comment: string = ""
  ): string {
    return `<data name="${name}" xml:space="preserve">\n\t<value>${value}</value>\n\t<comment>${comment}</comment>\n</data>`;
  }

  /**
   * Get the static html used for the editor webviews.
   */
  private getHtmlForWebview(webview: vscode.Webview): string {
    // Local path to script and css for the webview
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "media",
        "resourceScript.js"
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
