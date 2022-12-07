const { Server } = require("socket.io");

const port = 3000;
const clientOrigin = "http://localhost:5173";

const io = new Server(port, {
  cors: {
    origin: [clientOrigin],
  },
});

io.on("connection", (socket) => {
  console.log("gm!");
  console.log(socket.id);
});
