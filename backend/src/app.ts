import express from 'express'
import {BlackThoughtsRouter} from "./router"
import dotenv from "dotenv"
import { MongoClient} from "mongodb"

console.log("STARTING BACKEND SERVICE");

dotenv.config();

const App = express();

const uri = process.env.DB_URI;

if (uri) {
  const mongoClient = new MongoClient(uri);
  new BlackThoughtsRouter(App, mongoClient);
}

export default App;