import {ObjectId} from 'mongodb'

export type Workspace = {
    _id: ObjectId,
    name: String,
    type: "Workspace",
    userId: ObjectId,
    templateId: ObjectId,
    runtimeId?: ObjectId,
    content: unknown,
    lastUpdatedAt: Date,
}