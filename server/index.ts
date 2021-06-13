import express from "express";
import { Server, Socket } from "socket.io";
import { setupWaveSubscription } from "./waveSubscription";

function initServer() {
  const app = express();

  app.use(express.static("./public"));

  const nPort = process.env.PORT ?? 5000;
  const server = app.listen(nPort, () => {
    console.log(`Server is listening on ${nPort}`);
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });
  io.on("connection", (socket: Socket) => {
    console.log("New connection");

    socket.emit("hello", { message: "hello" });

    setupWaveSubscription(socket);
  });
}

initServer();
