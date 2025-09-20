import dotenv from 'dotenv';
import {MongoClient, ServerApiVersion} from 'mongodb';
import MongoStore from 'connect-mongo';

dotenv.config();
const DB_PORT = process.env.DB_PORT;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;
const DB_COLLECTION_NAME = process.env.DB_COLLECTION_NAME;
const DB_URI = process.env.DB_URI;

export const mongoClient = DB_URI
  ? new MongoClient(DB_URI, {serverApi: {version: ServerApiVersion.v1}}) /// DB_URI
  : new MongoClient(`mongodb://${DB_HOST}:${DB_PORT}`);

export const mongoStore = MongoStore.create({
  client: mongoClient,
  dbName: DB_NAME,
  collectionName: DB_COLLECTION_NAME
});

export const closeMongoConnection = async () => {
  try{
    await mongoClient.close();
  }
  catch(err){
    console.warn('⚠️ Failed to close MongoDB client.', err);
  }
};