import app from "./app";
import { MongoBootstrap } from "./bootstrap/mongo.bootstrap";
import { ServerBootstrap } from "./bootstrap/server.bootstrap";

(async () => {
  const serverBootstrap = new ServerBootstrap(app);
  const mongoBootstrap = new MongoBootstrap();
  try {
    await serverBootstrap.initialize();
    await mongoBootstrap.initialize();
  } catch (error) {
    console.log(error);
  }
})();
