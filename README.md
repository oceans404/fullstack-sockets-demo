# Build a Fullstack Chat app to learn Socket.io

## About Socket.io

We'll build a fullstack chat app using [Socket.io](https://socket.io/) a library for managing realtime, bi-directional, event based communication between a client (frontend) and server.

## Starter code

I created a starter frontend for you so you can focus on the socket server and client implementation rather than the form/ui creation. In this tutorial we will create a socket chat server. Then we will install [socket.io-client](https://socket.io/docs/v4/client-installation/) and rewire the frontend to connect to the server for bi-directional chat driven communication.

![chat frontend](https://user-images.githubusercontent.com/91382964/206026595-3f114974-54e1-472c-b2ad-f98424c52053.gif)

⭐ Star this repo and clone it:
```bash
git clone https://github.com/oceans404/fullstack-sockets-demo.git
cd fullstack-sockets-demo
```

Follow [frontend README instructions](https://github.com/oceans404/fullstack-sockets-demo/tree/main/frontend#readme) to start the client

## Tutorial

### 1. Create and run your server

```bash
cd server
touch server.js
```

In server/server.js
```node
console.log("gm from your server!")
```

Run the server
```bash
node server.js
```

Notice how this runs the console log one time and then exits. Let's install [nodemon](https://www.npmjs.com/package/nodemon), a dev tool for automatically restarting your server when file changes in the directory are detected so that we don't have to constantly restart the server. 

First create a .gitignore and ignore node modules in .gitignore

`touch .gitignore`
```bash
node_modules
```

Install nodemon

`npm install --save-dev nodemon`

Update your server's package.json to replace the test command with a start command: "start": "nodemon server.js"
```json
{
  "name": "socket-server",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "nodemon server.js"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}

```

Now you can start your server by running `npm start`, and it will auto restart any time you save new changes. Test this by changing your console log statement => `console.log("gm!");` and saving the server file.

Kill the server with ctrl + c so we can install new dependencies.

### 2. Install the [Socket.io Server API](https://socket.io/docs/v4/server-installation/)

`npm install socket.io`

Initialize Server: server/server.js

```node
const { Server } = require("socket.io");

const port = 3000;

const io = new Server(port, {
  /* options */
});

io.on("connection", (socket) => {
  console.log("gm!");
  console.log(socket.id);
});

```

Restart the server: `npm start`. Notice that nothing is logged. This is because the console log statements are waiting for a "connection" event. On connection, "gm!" and the socket id will be logged. Let's keep the server running and send a connection event from the client.


### 3. Update the client/frontend to work with Socket.io

Open a second terminal window and cd into the frontend folder

```bash
cd ..
cd frontend
```

Install the [Socket.io Client API](https://socket.io/docs/v4/client-installation/)

`npm install socket.io-client`

Create a file for socket connection

`touch src/socket.js`

Import the socket dependency and create a connectToSocket function in src/socket.js

```js
import { io } from "socket.io-client";

export function connectToSocket() {
  const serverURL = "http://localhost:3000";
  const socket = io(serverURL);

  console.log(socket);
}

```

Call this function in the initial useEffect in src/App.jsx

`import { connectToSocket } from "./socket";`
```js
useEffect(() => {
    scrollToNewChat();
    connectToSocket();

}, [chats]);
```

Start the frontend by following [frontend README instructions](https://github.com/oceans404/fullstack-sockets-demo/tree/main/frontend#readme) and open your chrome dev tools to the console tab. You will see 2 errors. These errors are repeated every few seconds because of HTTP long-polling transport (also simply referred as "polling") or consecutive HTTP requests being blocked by the server and then retried. 

<img width="1252" alt="Screen Shot 2022-12-07 at 10 15 20 AM" src="https://user-images.githubusercontent.com/91382964/206263267-b6800de0-38e5-40a8-8071-36e78275ffcc.png">

### 4. Fix Socket.io CORS Error

```bash
Error: Access to XMLHttpRequest at 'http://localhost:3000/socket.io/?EIO=4&transport=polling&t=OJjp230' from origin 'http://localhost:5173' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```
To fix this CORS error, we need to [explicitly enable CORS](https://socket.io/docs/v4/handling-cors/#cors-header-access-control-allow-origin-missing) (Cross-Origin Resource Sharing) on the server.

Within server/server.js, replace /* options */ with a cors object that specifies your client origin aka where your frontend is running. Mine is on localhost:5173

```js
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
```

Refresh your frontend website and open the console tool. Every time you refresh the frontend, your cli logs 'gm!' and the new frontend socket id. The frontend logs the socket object with a matching id.

<img width="1251" alt="Screen Shot 2022-12-07 at 10 34 14 AM" src="https://user-images.githubusercontent.com/91382964/206266784-9cb11108-5851-423a-b919-f820d4f2e924.png">

