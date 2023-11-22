import mongoose from "mongoose";

import yenv from "yenv";

export interface IMongoBootstrap {
  initialize(): Promise<any>;
  getConnection(): any;
}

const env = yenv();
let client: any;

export class MongoBootstrap implements IMongoBootstrap {
  async initialize(): Promise<any> {
    // const MONGO_URI = `mongodb://${encodeURIComponent(
    //   env.MONGO_USER ?? ""
    // )}:${encodeURIComponent(env.MONGO_PASS ?? "")}@${encodeURIComponent(
    //   env.MONGO_HOST ?? ""
    // )}:${
    //   env.MONGO_PORT
    // }/?tls=true&tlsCAFile=./global-bundle.pem&retryWrites=false`; userPassword

    // const MONGO_URI = `mongodb://root:${encodeURIComponent(
    //   "Wsper23@@89La"
    // )}@192.241.154.250:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.0.2`;

    const MONGO_URI =
      "mongodb+srv://userBot:userPassword@mongocluster.s7ldelx.mongodb.net/";
    // const MONGO_URI = "mongodb+srv://maggiebot:botmaggie@192.241.154.250/";
    try {
      const db = await mongoose.connect(MONGO_URI);
      console.log(
        `----- Database: ${db.connection.db.databaseName} is conected! ------`
      );
    } catch (error) {
      console.log("Error connecting to the database:", error);
      throw error;
    }
  }
  getConnection() {
    return client;
  }
}
