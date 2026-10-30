import * as MongoDB from "mongodb"
import dotenv from "dotenv";
import { MongoClient, ObjectId, GridFSBucket } from "mongodb"
const Stream = require('node:stream');

import { ValidDataType, ValidDataTypeName } from "./types/ValidDataType.ts";
import {Runtime, Template} from './types/Runtime.ts'
import { ContentPost, Thumbnail } from "./types/ContentPost.ts"
import {Workspace} from './types/Workspace.ts'
import {StreamFile} from './types/StreamFile.ts'
import {User} from './types/User.ts'
import {  IServiceResponse,
          failureServiceResponse,
          successfulServiceResponse} from "./types/IServiceResponse.ts"


//collection names

type CollectionName = "Runtimes" | "Templates" | "ContentPosts" | "Workspaces" | "Thumbnails" | "Users" | "Unknown";
const runtimeCollectionName = "Runtimes";
const templateCollectionName = "Templates";
const contentPostCollectionName = "ContentPosts";
const workspaceCollectionName = "Workspaces"
const thumbnailCollectionName = "Thumbnails";
const userCollectionName = "Users";

const getCollectionName = (type: ValidDataTypeName): CollectionName => {
    switch (type) {
        case "Runtime": return runtimeCollectionName;
        case "Template": return templateCollectionName;
        case "ContentPost": return contentPostCollectionName;
        case "Workspace": return workspaceCollectionName;
        case "Thumbnail": return thumbnailCollectionName;
        case "User": return userCollectionName;
        default: return "Unknown";
    }
}

//Server class implementation
export class Server {
  client: MongoDB.MongoClient;
  bucket: GridFSBucket;

  constructor(cli : MongoDB.MongoClient) {
    this.client = cli;
    this.bucket = new GridFSBucket(this.client.db(), {bucketName: 'fileBucket'});
  }

  async initConnection() : Promise<any> {
    //establish connection with database
    await this.client.connect().then(() => console.log("Successfully Connected to MongoDB"))
  }

  //uploads a file buffer to the database's GridFS bucket 
  async uploadFile(title: string, buffer: Buffer, mimetype: string): Promise<IServiceResponse<ObjectId>> {
    console.log("SERVER UPLOAD FILE");
    try {

      const uploadStream = this.bucket.openUploadStream(title, {
        metadata: {
            mimetype: mimetype,
            dateUploaded: Date.now(),
        }
      });

      return await new Promise((resolve,reject) => {
        uploadStream.on("finish", ()=> {
          // console.log(uploadStream.id);
          resolve(successfulServiceResponse(uploadStream.id));
        })

        uploadStream.on("error", err => {
          console.error(err);
          reject(err);
        });

        try {
          uploadStream.end(buffer);
        } catch {
          console.error("pipe threw");
        }

      })
    } catch(e) {
      console.log("not success");
      return e instanceof Error? failureServiceResponse(e.message) : failureServiceResponse(String(e));
    }
  }


  async retrieveFile(id: ObjectId): Promise<StreamFile> {
    console.log(`SERVER RETRIEVE FILE : ${id}`);

    const file = await this.bucket.find({_id: id}).next();

    if (!file) {
    //   console.log("file not found");
      throw new Error("File not found");
    }

    if (!file.metadata) {
    //   console.log("file metadata not found");
      throw new Error("File metadata not found");
    }

    return {
      stream: this.bucket.openDownloadStream(id),
      mimetype: file.metadata.mimetype.toString(),
      fileSize: file.length,
    };
  }

//insert
 async insertData(data: ValidDataType): Promise<IServiceResponse<ValidDataType>> {
  console.log("SERVER Adding new data");

  try {
    const collectionName = getCollectionName(data.type);
    if (collectionName === "Unknown") throw Error(`Collections do not exist for data of type ${data.type}`);
    const collection = await this.client
      .db()
      .collection<ValidDataType>(collectionName).insertOne(data);
    return successfulServiceResponse(data);
  }  catch(e) {
    return failureServiceResponse(`Failed to insert data into database: ${String(e)}`);
  } 
}

//clear collection
async clearCollection(collectionName: CollectionName): Promise<IServiceResponse<null>> {
  try {
      const response = await this.client.db().collection(collectionName).deleteMany({})
      return successfulServiceResponse(null)
  } catch(e) {
      return failureServiceResponse(`Failed to clear ${collectionName} colleciton`);
  }
}


async getThumbnails(): Promise<IServiceResponse<Thumbnail[]>> {

  console.log("SERVER GET Thumbnails")
//   const cursor = this.bucket.find({});
  // for await (const doc of cursor) {
  //   console.log(doc);
  // }

  const findResponse = await this.client
      .db()
      .collection<Thumbnail>(getCollectionName("Thumbnail"))
      .find().toArray();                                            //TODO: limit number of posts for pagination, sort in order of most recent
    if (findResponse == null) {
      return failureServiceResponse("Failed to retrieve content");
    } else {
      return successfulServiceResponse(findResponse);
    }
}

async getContentPosts(): Promise<IServiceResponse<ContentPost[]>> {

  console.log("SERVER GET Posts")
//   const cursor = this.bucket.find({});
  // for await (const doc of cursor) {
  //   console.log(doc);
  // }

  const findResponse = await this.client
      .db()
      .collection<ContentPost>(getCollectionName("ContentPost"))
      .find().toArray();                                            //TODO: limit number of posts for pagination, sort in order of most recent
    if (findResponse == null) {
      return failureServiceResponse("Failed to retrieve content");
    } else {
      return successfulServiceResponse(findResponse);
    }
}

//find by id
async findDataById(dataId: ObjectId, type: ValidDataTypeName): Promise<IServiceResponse<ValidDataType>> {
  console.log(`SERVER FINDING DATA ${dataId} in ${getCollectionName(type)}`);
  const findResponse = await this.client
      .db()
      .collection<ValidDataType>(getCollectionName(type))
      .findOne({ _id: dataId });
    if (findResponse == null) {
      return failureServiceResponse(`Failed to find ${type} with id ${dataId}`);
    } else {
      // console.log(findResponse);
      return successfulServiceResponse(findResponse);
    }
}

//find multiple documents by their ids
async findMultipleDataById(dataIds: ObjectId[], type: ValidDataTypeName): Promise<IServiceResponse<ValidDataType[]>> {
    const res = await this.client
    .db()
    .collection<ValidDataType>(getCollectionName(type))
    .find({ id: { $in: dataIds } }).toArray();

    if (res == null) {
      return failureServiceResponse(`Failed to find any ${type}s with with any of the given ids`);
    } else {
      return successfulServiceResponse(res);
    }
}

//update Data
  async updateData(
    dataId: ObjectId, type: ValidDataTypeName, updatedProperties: Record<string, unknown>): Promise<IServiceResponse<ValidDataType>> {
    const updateResponse = await this.client
      .db()
      .collection(getCollectionName(type))
      .findOneAndUpdate(
        { _id: dataId },
        { $set: updatedProperties },
        { returnDocument: "after" }
      );
    if (updateResponse && updateResponse.ok && updateResponse.lastErrorObject.n) {
      return successfulServiceResponse(updateResponse.value);
    }

    const errorString = updateResponse ? updateResponse.lastErrorObject : "";
    return failureServiceResponse(
      `Failed to update ${type}, lastErrorObject: ${errorString}`);
  }

//delete data
  async deleteData(dataId: ObjectId, type: ValidDataTypeName): Promise<IServiceResponse<null>> {
    console.log(`SERVER DELETING : ${dataId}`);

    try {
      const collection = await this.client.db().collection<ValidDataType>(getCollectionName(type));
      await collection.deleteOne({ _id: dataId }).then((res) => {
        console.log("Items deleted: ", res.deletedCount)
      })

      return successfulServiceResponse(null);
    } catch {
      return failureServiceResponse(`Failed to delete ${type} ${dataId}`);
    }
  }

  //delete multiple data
  async deleteMultipleData(dataIds: ObjectId[], type: ValidDataTypeName): Promise<IServiceResponse<null>> {
    try {
          const collection = await this.client.db().collection(getCollectionName(type));
          const myquery = { _id: { $in: dataIds } };
          const deleteResponse = await collection.deleteMany(myquery);
          return successfulServiceResponse(null);
    } catch {
          return failureServiceResponse("Failed to delete data (many)");
    }
  }
}


