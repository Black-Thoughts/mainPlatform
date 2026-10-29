import {ObjectId} from 'mongodb'

export type User = {
    _id: ObjectId,
    type: "User",
    email: String,
    username: String,
    createdAt: Date,
    posts: ObjectId[],
    templates?: ObjectId[],
    runtimes?: ObjectId[],
}