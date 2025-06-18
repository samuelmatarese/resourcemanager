import * as vscode from "vscode";
import { ResourceEditorProvider } from "./resxEditor";

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(ResourceEditorProvider.register(context));
}
