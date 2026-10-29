//External
import express, { Request, Response, Router } from "express"
import cors from "cors"
import { MongoClient, ObjectId } from "mongodb"
import dotenv from "dotenv"
import { json } from "body-parser"
import multer from "multer"

//Internal
import {config} from './config.ts' 
import { ValidDataType, ValidDataTypeName, isValidDataTypeName } from "./types/ValidDataType.ts"
import {IServiceResponse} from "./types/IServiceResponse"
import {Server} from "./server"
import { ContentPost, Thumbnail } from "./types/ContentPost.ts"

const upload = multer();
const bodyJsonParser = json();
export const ExpressRouter: Router = express.Router()
dotenv.config()
const PORT = process.env.PORT

export class BlackThoughtsRouter {
  Server: Server;

  constructor(App: express.Application, client?: MongoClient) {

    if (client) {
      this.Server = new Server(client)
      this.Server.initConnection()
    }
    else {
      dotenv.config()
      const uri: string = process.env.DB_URI as string;
      const mongoClient = new MongoClient(uri);
      this.Server = new Server(mongoClient)
    }

    //middleware

    const allowedOrigins = [
      config.clientOrigin,
      "http://localhost:5174",
      config.runtimeOrigin,
    ]

    App.use(cors({

      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin not allowed by CORS: ${origin}`));
        }
      }
    }));

    // App.use((req, res, next) => {
    //   console.log("URL:", req.originalUrl);
    //   console.log("Method:", req.method);
    //   console.log("Headers:", req.headers);
    //   console.log("Request origin:", req.headers.origin);

    //   res.on("finish", () => {
    //     console.log("Response status:", res.statusCode, "CORS header:", res.getHeader("Access-Control-Allow-Origin"));
    //   });

    //   next();
    // });

    App.use(express.static("dist"));    //what does this do?
    App.use(express.json());
    App.use(express.urlencoded({ extended: true })); 
    App.use(ExpressRouter);

    // App.listen(PORT, () => {
    //   console.log("Server started on port", PORT);
    // });

            /**
     * Request to retrieve all Tracks
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    // ExpressRouter.get(
    //   "/",
    //   async (req: Request, res: Response) => {
    //     try {          
    //       const response: IServiceResponse<Thumbnail[]> =
    //         await this.Server.getThumbnails();
    //       res.status(200).send(response);
    //     } catch (e : any) {
    //       console.log("ROUTER failed to get tracks");
    //       res.status(500).send(e.message);
    //     }
    //   }
    // );
    ExpressRouter.get(
      "/",
      async (req: Request, res: Response) => {
        console.log("ROUTER get posts");
        try {          
          const response: IServiceResponse<ContentPost[]> =
            await this.Server.getContentPosts();
          res.status(200).send(response);
        } catch (e : any) {
          console.log("ROUTER failed to get tracks");
          res.status(500).send(e.message);
        }
      }
    );

    ExpressRouter.get(
      "/file/:fileId",
      async (req: Request, res: Response) => {
        console.log("ROUTER GETTING FILE");
        try {
          console.log("ROUTER TRYING");
          const fileId = String(req.params.fileId);
          const range = req.headers.range;
          console.log(`ID: ${fileId}`);

          const file = await this.Server.retrieveFile(new ObjectId(fileId));
          const fileSize = file.fileSize;
          const mimetype: string = file.mimetype;

          if (range) {
            // Parse layout like "bytes=0-100000"
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            // If the browser didn't specify an end byte, stream until the end of the file
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;             
            const chunksize = (end - start) + 1;

            //  res.setHeader("Content-Type", mimetype);
            // res.setHeader("Accept-Ranges", "bytes");

            // Crucial Response Headers for 206 Partial Content
            res.writeHead(206, {
              'Content-Range': `bytes ${start}-${end}/${fileSize}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunksize,
              'Content-Type': mimetype,
            });
          } else {
            res.writeHead(200, {
              'Content-Length': fileSize,
              'Content-Type': mimetype,
              'Accept-Ranges': 'bytes' // Tell the browser it *can* use ranges next time
            });
          }

          file.stream.on("error", (err) => {
            console.error("FILE STREAM ERROR", err.message);
          })

          file.stream.pipe(res);
        } catch (e : any) {
          res.status(404).send(e.message);
        }
      }
    );

    /**
     * Request to retrieve nodes by nodeIds
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    ExpressRouter.get(
      "/getMany/:dataType",
      async (req: Request, res: Response) => {
        try {
          const dataIds = req.body.dataIds;
          const dataType = String(req.params.dataType);
          if (isValidDataTypeName(dataType)) {
            const objectIds = dataIds.map((id) => new ObjectId(String(id)));
            const response: IServiceResponse<ValidDataType[]> =
            await this.Server.findMultipleDataById(objectIds, dataType as ValidDataTypeName);
            res.status(200).send(response);
          }
          
        } catch (e : any) {
          res.status(500).send(e.message);
        }
      }
    );

    /**
     * Request to retrieve data by dataId
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    ExpressRouter.get(
      "/:dataType/:dataId",
      async (req: Request, res: Response) => {
        console.log(`ROUTER GETTING ${req.params.dataType}`, req.params.dataId);

        if (!/^[0-9a-fA-F]{24}$/.test(req.params.dataId as string)) {
            console.log('invalid id');
            return res.status(400).json({
                error: "Invalid data ID",
            });
        }

        const typeString: String = String(req.params.dataType);
        const dataId = new ObjectId(req.params.dataId as string);
        try {
            if (isValidDataTypeName(typeString)) {
                const response: IServiceResponse<ValidDataType> =
                await this.Server.findDataById(dataId, typeString as ValidDataTypeName);
                res.status(200).send(response);
            } else {
                throw Error(`${typeString} is not a valid type`);
            }
        } catch (e : any) {
          res.status(500).send(e.message);
        }
      }
    );

    ExpressRouter.post('/uploadFile', upload.single("file"), async (req: Request, res: Response) => {
        console.log("ROUTER UPLOAD FILE");
        // console.log("File", req.file);
        // console.log("Body", req.body);
        const file = req.file as Express.Multer.File;
        if (file.mimetype === undefined) {
            console.log(`file must have mimetype`);
            return;
        }

            //upload file to GridFS bucket
        try {
            const uploadRes = await this.Server.uploadFile(file.originalname, file.buffer, file.mimetype);
            console.log("ROUTER PAYLOAD", uploadRes.payload);
            res.status(200).send(uploadRes);
        } catch (e: any) {
            console.log("uploadFile unsuccessful");
            console.error(e.message);
            res.status(200).send(e.message);
        } 
    })

    //TODO: upload multiple files


    /**
     * Request to create node
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    // ExpressRouter.post("/create", upload.array("files"), async (req: Request, res: Response) => {

    ExpressRouter.post("/upload", async (req: Request, res: Response) => {
        console.log("ROUTER POST");

        try {
            const data = req.body
            console.log(data);
            const dataType = data.type;

            if (isValidDataTypeName(dataType)) {
                const response = await this.Server.insertData(data);
                res.status(200).send(response);
            } else {
                throw Error(`data of type ${dataType} is invalid`);
            }
        } catch (e : any) {
            res.status(500).send(e.message);
        }
    });

    /**
     * Request to update the node with the given nodeId
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    // ExpressRouter.put(
    //   "/:_id",
    //   upload.array("files"),
    //   async (req: Request, res: Response) => {
    //     console.log(req.body);

    //     return;

    //     try {
    //       const TrackId = req.params._id as ObjectId;
    //       const response = await this.Server.updateTrack(
    //         TrackId,
    //         req.body
    //       );
    //       res.status(200).send(response);
    //     } catch (e : any) {
    //       res.status(500).send(e.message);
    //     }
    //   }
    // );

    // ExpressRouter.put(
    //   "/updateStacks/:_id",
    //   async (req: Request, res: Response) => {
    //     console.log("ROUTER update stacks");

    //     try {
    //       const TrackId = new ObjectId(req.params._id.toString());
    //       const response = await this.Server.updateStacks(
    //         TrackId,
    //         req.body
    //       );
    //       res.status(200).send(response);
    //     } catch (e : any) {
    //       res.status(500).send(e.message);
    //     }
    //   }
    // );

  }

      /**
     * @returns NodeRouter class
     */
    getExpressRouter = (): Router => {
      return ExpressRouter;
    };
}