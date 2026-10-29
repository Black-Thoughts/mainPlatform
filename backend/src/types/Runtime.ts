import {ObjectId} from 'mongodb'

export type Runtime = {
    _id: ObjectId,
    name?: String,
    type: "Runtime",
    url: String,
    version: Number,
    createdBy: ObjectId,
    forkedFrom?: String | null,
}

export type Template = {
    _id: ObjectId,
    name: String,
    type: "Template",
    runtimeId: ObjectId,
    defaultContent: unknown,
    createdBy: String,
    forkedFrom?: String | null,
    visibility: "public" | "private"
}



