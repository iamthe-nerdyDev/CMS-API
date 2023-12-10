import Socket from "../classes/socket.class";
import { IEmit } from "../interface";

export const broadcastEvent = (data: IEmit) => {
  const socketInstance = new Socket();

  socketInstance.emit(data);

  socketInstance.close();
};
