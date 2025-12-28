import { CellType } from "./cellType";

export type UpdateEntryEventArgs = {
    id : string;
    newValue: string;
    cellType: CellType
}