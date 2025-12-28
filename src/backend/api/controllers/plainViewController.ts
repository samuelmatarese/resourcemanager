import * as vscode from "vscode";
import { Routes } from "../../../shared/constants/vscodeRoutes";
import { PlainViewService } from "../../application/services/plainViewService";

export class PlainViewController{
    public static async MapEndpoints(route: string, document: vscode.TextDocument, args: any){
        switch (route){
            case Routes.EditPlainText:
            await PlainViewService.ChangeText(document, args);
            return;
        }
    }
}