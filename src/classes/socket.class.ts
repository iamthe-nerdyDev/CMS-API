import { io, Socket as SocketIO } from "socket.io-client";
import { config } from "../config";
import log from "../utils/logger";

class Socket {
  private socket: SocketIO;

  constructor() {
    this.socket = io(config.base_url);

    this.socket.on("connection", () => log.info("Connected 🔌"));
  }

  emit = (data: any) => this.socket.emit("response", data);
}

export default Socket;
