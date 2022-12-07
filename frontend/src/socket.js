import { io } from "socket.io-client";

export function connectToSocket() {
  const serverURL = "http://localhost:3000";
  const socket = io(serverURL);

  console.log(socket);
}
