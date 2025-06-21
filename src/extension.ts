import * as vscode from "vscode";
import { ResourceEditorProvider } from "./backend/resxEditor";

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(ResourceEditorProvider.register(context));
}
