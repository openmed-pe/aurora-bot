import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import yenv from "yenv";

export interface IDatabaseBootstrap {
  initialize(): Promise<any>;
  getConnection(): any;
}

const env = yenv();
let client: any;

export class DatabaseBootstrap implements IDatabaseBootstrap {
  async initialize(): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      const parametersConection = {
        region: env.DATABASE.DYNAMO.REGION,
        credentials: {
          accessKeyId: env.DATABASE.DYNAMO.KEY,
          secretAccessKey: env.DATABASE.DYNAMO.SECRETKEY,
        },
      };
      client = new DynamoDBClient([parametersConection]);
    });

    await promise;
  }
  getConnection() {
    return client;
  }
}
