import Socket from "../classes/socket.class";
import { IEmit } from "../interface";

const socketInstance = new Socket();

export const broadcastEvent = (data: IEmit) => socketInstance.emit(data);
