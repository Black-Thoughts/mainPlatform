import {Runtime, Template} from './Runtime.ts'
import { ContentPost, Thumbnail } from "./ContentPost.ts"
import {Workspace} from './Workspace.ts'
import {User} from './User.ts'

export type ValidDataType = Runtime | Template | ContentPost | Workspace | User | Thumbnail;
export type ValidDataTypeName = "Runtime" | "Template" | "ContentPost" | "Workspace" | "Thumbnail" | "User";

export const isValidDataTypeName = (s: any) => {
    return s === "Runtime" || s === "Template" || s === "ContentPost" || s === "Workspace" || s === "Thumbnail" || s === "User";
}
