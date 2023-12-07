import httpServer from "./utils/httpServer";
import { config } from "./config";
import { Server, Socket } from "socket.io";
import log from "./utils/logger";

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket: Socket) => {
  log.info(`New connection to socket ✅: ${socket.id}`);

  socket.on("response", (data) => socket.broadcast.emit("response", data));
});

httpServer.listen(config.server.port, () => {
  log.info(`Server is running on port: ${config.server.port}`);
});
