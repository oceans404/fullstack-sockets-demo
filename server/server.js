const { Server } = require("socket.io");

const port = 3000;
const clientOrigin = "http://localhost:5173";

const io = new Server(port, {
  cors: {
    origin: [clientOrigin],
  },
});

const countConnectedClients = () => io.engine.clientsCount;

io.on("connect", (socket) => {
  console.log("gm!");
  console.log(`${socket.id} just connected`);
  console.log(`${countConnectedClients()} clients are online`);

  socket.on("disconnect", (reason) => {
    console.log(`${socket.id} just disconnected`);
    console.log(`${countConnectedClients()} clients are online`);
  });

  socket.on("set-username", (username) => {
    console.log(username, socket.id);
    io.emit("new-user", username);
  });

  socket.on("send-message", (messageInfo) => {
    io.emit("new-message", messageInfo);
  });
});
