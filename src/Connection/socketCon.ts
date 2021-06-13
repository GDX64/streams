import { io } from "socket.io-client";

const websocketCon = io("http://localhost:5000");

websocketCon.on("hello", console.log);

export { websocketCon };
