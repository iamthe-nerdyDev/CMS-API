import http from "http";
import { config } from "./config";
import createServer from "./utils/app";

const app = createServer();

http.createServer(app).listen(config.server.port, () => {
  console.log(`Server is running on port: ${config.server.port}`);
});
