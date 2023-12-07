import Socket from "../classes/socket.class";

const socketInstance = new Socket();

export const broadcastEvent = (data: any) => socketInstance.emit(data);
