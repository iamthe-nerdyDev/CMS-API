import { io, Socket as SocketIO } from "socket.io-client";
import { config } from "../config";
import log from "../utils/logger";
import { IEmit } from "../interface";

class Socket {
  private socket: SocketIO;

  constructor() {
    this.socket = io(config.base_url);

    this.socket.on("connection", () => log.info("Connected 🔌"));
    this.socket.on("disconnect", () => log.info("Disconnected ❌"));
  }

  emit = (data: IEmit) => this.socket.emit("response", data);

  close = () => (this.socket.connected ? this.socket.disconnect() : false);
}

export default Socket;
