import * as MongoDB from "mongodb";

export type StreamFile = {
    stream: MongoDB.GridFSBucketReadStream, 
    mimetype: string,
    fileSize: number
}
