import http from "http";
import { config } from "./config";
import createServer from "./utils/app";
import log from "./utils/logger";

const app = createServer();

http.createServer(app).listen(config.server.port, () => {
  log.info(`Server is running on port: ${config.server.port}`);
});
