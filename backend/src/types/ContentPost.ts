import {ObjectId} from 'mongodb'

export type ContentPost = {
    _id: ObjectId,
    name: String,
    type: "ContentPost",
    userId: ObjectId,
    templateId: ObjectId,
    runtimeId?: ObjectId,
    content: unknown,
    updatedAt: Date,
}

//not sure what type the image should be
export type Thumbnail = {
    _id: ObjectId,
    type: "Thumbnail",
    name: String,
    image: Buffer,
    dateUploaded: Date,
}