# Build a Fullstack Chat app to learn Socket.io

## About Socket.io

We'll build a fullstack chat app using React (Vite), Node.js, and [Socket.io](https://socket.io/) a library for managing realtime, bi-directional, event based communication between a client (frontend) and server.

Check out the completed code on the done branch: [fullstack-sockets-demo/tree/done](https://github.com/oceans404/fullstack-sockets-demo/tree/done). The deployed site is live: https://proud-cell-8475.on.fleek.co/

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

Import the socket dependency and create a socket connection above the App component in src/App.jsx

```js
import { io } from "socket.io-client";

const serverURL = "http://localhost:3000";
const socket = io(serverURL);
```

Within the App component in src/App.jsx, create a useEffect that runs once at component render. Add an event listener to watch for socket connection and console log the socket. Remove the listener in the cleanup step to prevent multiple event registrations.

```js
useEffect(() => {
  socket.on("connect", () => {
    console.log(socket);
  });

  return () => {
    socket.off("connect");
  };
}, []);
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

io.on("connect", (socket) => {
  console.log("gm!");
  console.log(socket.id);
});
```

### 5. Track Socket Connect, Disconnect, and ClientsCount

Refresh your frontend website and open the console tool. Every time you refresh the frontend, your server logs 'gm!' and the new frontend socket id onto the cli. The frontend logs the socket object with a matching id.

<img width="1251" alt="Screen Shot 2022-12-07 at 10 34 14 AM" src="https://user-images.githubusercontent.com/91382964/206266784-9cb11108-5851-423a-b919-f820d4f2e924.png">

Every open instance of the frontend counts as 1 "connection." If you open 3 different tabs to localhost:5173, the server logs connection to each. The server can track connection, disconnection, and connected client count.

In server/server.js use [io.engine](https://socket.io/docs/v4/server-instance/#serverengine) to create a countConnectedClients function to fetch the number of currently connected clients. Log this in your "connect" function. We also want to track disconnection from the socket. Nest a ["disconnect" event listener](https://socket.io/docs/v4/server-socket-instance/#disconnect) to watch for that action on every connected socket. 

```node
const countConnectedClients = () => io.engine.clientsCount;

io.on("connect", (socket) => {
  console.log("gm!");
  console.log(`${socket.id} just connected`);
  console.log(`${countConnectedClients()} clients are online`);

  socket.on("disconnect", (reason) => {
    console.log(`${socket.id} just disconnected`);
    console.log(`${countConnectedClients()} clients are online`);
  });
});
```

### 6. Learn how to "emit" custom events with data

We've proved that our server can "hear" connect and disconnect events from our client and count the total current connections. Connect,  disconnect, and connect_error are 3 [special events](https://socket.io/docs/v4/client-socket-instance/#events) defined by socket. You can also define your own events + any data and "emit" these in either direction 



**Custom Emit Example 1: Emit "gm" event from server -> client**

Server
```node
io.on("connect", (socket) => {
  socket.emit("gm", "frens");
});
```
Client

```node
socket.on("gm", (arg) => {
  console.log(arg); // frens
});
```

**Custom Emit Example 2: Emit "gn" event from client -> server**

Client

```node
socket.emit("gn", {name: "steph"});
```

Server
```node
io.on("connect", (socket) => {
  socket.on("gn", (arg) => {
    console.log(arg); // {name: "steph"}
  });
});
```

### 7. Emit "set-username" and "new-user" events

Emit a "set-username" event from the client

frontend/src/App.jsx
```js
const handleUsername = ({ Username }) => {
    setUserName(Username);
    socket.emit("set-username", Username);
};
```

Nest a "set-username" watcher within the connect event in the server. After a username is set, emit a "new-user" event to all clients.

server/server.js

```node
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
});
```

Update the initial useEffect to watch for "new-user" events and log when there is a new user. Remove the "new-user" listener in the cleanup step. 

frontend/src/App.jsx

```js
useEffect(() => {
    socket.on("connect", () => {
      console.log(socket.id);
    });

    socket.on("new-user", (user) => console.log(`new user: ${user}`));

    return () => {
      socket.off("connect");
      socket.off("new-user");
    };
  }, []);
```


### 8. Emit "send-message" and "new-message" events

Update the handleSendMessage function to emit a "send-message" event with data that includes the current userName and the message.

frontend/src/App.jsx

```js
const handleSendMessage = ({ Message }) => {
    socket.emit("send-message", { userName, message: Message });
};
```

Nest a "send-message" watcher within the connect event in the server. After a message is sent, emit a "new-message" event to all clients.

server/server.js

```node
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
```

Update the initial useEffect to watch for "new-message" events. When there is a new message, update the state with the setChats setter to add the new message to the chats array. `chats` are already mapped visually by the App component.

Remove the "new-message" listener in the cleanup step. 

frontend/src/App.jsx

```js
 useEffect(() => {
    socket.on("connect", () => {
      console.log(socket.id);
    });

    socket.on("new-message", (newChat) => {
      setChats((chats) => [...chats, newChat]);
    });

    socket.on("new-user", (user) => console.log(`new user: ${user}`));

    return () => {
      socket.off("connect");
      socket.off("new-message");
      socket.off("new-user");
    };
}, []);
```

🥳 Ta-da! We've built minimal chat app with sockets:

![chat](https://user-images.githubusercontent.com/91382964/206546634-d9318a05-a434-422a-b5f5-a28c29c4a231.gif)



### 9. Add optional frontend improvements

- Show an "online now" list of connected usernames
- Add "[userName] has entered the chat" / "[userName] has left the chat" messages
- Only keep the latest N messages stored as `chats` in state as new messages come in.


### 10. Deployment - gtfo localhost

Currently, the server lives on localhost:3000 while running `npm start` and the frontend lives on localhost:5173 while running `npm run dev`. These URLS paths are hardcoded in the frontend and server. Let's move these into environment variables.

#### Refactor frontend to add environment variables

1. Create an .env file

```bash
cd frontend
touch .env
```

2. Add a VITE_SERVER_URL variable to the .env file and set the value to your local server url

frontend/.env
```
VITE_SERVER_URL="http://localhost:3000"
```

3. Add .env to the .gitignore

frontend/.gitignore
```
.env
```

4. Replace the serverURL value with a reference to the variable in the .env file

frontend/src/App.jsx
```js
const serverURL = import.meta.env.VITE_SERVER_URL;
```

#### Refactor server to add environment variables

1. Install dotenv and create an .env file

```bash
cd server
npm i dotenv
touch .env
```

2. Add a NODE_CLIENT_ORIGIN variable to the .env file and set the value to your frontend local host

server/.env
```
NODE_CLIENT_ORIGIN="http://localhost:5173"
```

3. Add .env to the .gitignore

server/.gitignore
```
node_modules
.env
```

4. Require the dotenv dependency at the top of your server file. Replace the clientOrigin value with a reference to the variable in the .env file

server/server.js
```js
require('dotenv').config()
```

```js
const clientOrigin = process.env.NODE_CLIENT_ORIGIN;
```

#### Deploy your frontend 

Let's host our frontend on IPFS for free using [Fleek](https://app.fleek.co/)

1. [Sign in with Ethereum](https://app.fleek.co/#/auth/sign-in) - sign a transaction to connect your wallet of choice
2. Click "Add a New Site"
3. Connect your Github
4. Select your repo: oceans404/fullstack-sockets-demo
5. Hosting service: IPFS
6. Use the following settings. Then open Advanced and add a VITE_SERVER_URL environment variable of http://localhost:3000. We will update this after deploying the server.

<img width="665" alt="Screen Shot 2022-12-13 at 4 45 34 PM" src="https://user-images.githubusercontent.com/91382964/207476764-c8a6315c-6236-4ba4-ab49-218179e87a7e.png">

7. Click deploy site. Fleek will build and deploying your site to IPFS and their CDN.

8. Check the last line of the deploy log for your deployed site. My frontend was deployed to https://proud-cell-8475.on.fleek.co 🥳
<img width="1176" alt="Screen Shot 2022-12-13 at 4 50 31 PM" src="https://user-images.githubusercontent.com/91382964/207477344-e0888eff-528e-40ed-af8f-c022c5e45742.png">

9. Visit your deployed frontend. Uh-oh, it's not working yet! That's because it's not able to connect to your server at localhost:3000... let's deploy the server next.

<img width="1170" alt="Screen Shot 2022-12-13 at 4 52 35 PM" src="https://user-images.githubusercontent.com/91382964/207477622-d19a2f93-0b65-411d-a48a-51968dbb8273.png">



#### Deploy your server 

Let's deploy and host our Node.js app for free with [Render](https://render.com/).

1. [Sign up for Render](https://render.com/register) and sign in
2. Select "New Web Service" on the dashboard page
3. Connect the oceans404 / fullstack-sockets-demo repo
4. Use the following settings. 
<img width="789" alt="Screen Shot 2022-12-13 at 4 56 39 PM" src="https://user-images.githubusercontent.com/91382964/207478129-d9277b8a-4a99-4ef9-8769-caccb2e348c0.png">
5. Open Advanced and add a NODE_CLIENT_ORIGIN environment variable of whatever your Fleek frontend was

Mine is set to NODE_CLIENT_ORIGIN: https://proud-cell-8475.on.fleek.co

<img width="798" alt="Screen Shot 2022-12-13 at 4 58 59 PM" src="https://user-images.githubusercontent.com/91382964/207478396-cbad69e2-336d-4e0d-b7d8-8f4b17252930.png">

6. Click "Create Web Service" and copy the deployed server url your service name. Mine is https://socket-server-gjqh.onrender.com

<img width="975" alt="Screen Shot 2022-12-13 at 5 05 55 PM" src="https://user-images.githubusercontent.com/91382964/207479788-5a7a8e75-06e3-4251-a6d0-d7fa670fea2e.png">

7. Go back to the Fleek dashboard. Hosting > Settings > Build & Deploy > Advanced Build Settings > Environment Variables. Edit settings in the "Environment Variables" tab and update VITE_SERVER_URL to your server url. Save.

<img width="1177" alt="Screen Shot 2022-12-13 at 5 10 08 PM" src="https://user-images.githubusercontent.com/91382964/207480208-8a76a335-b385-43e2-aeb2-a27950b442f6.png">


8. Go to the Deploys tab and click "Trigger Redeploy"

<img width="1179" alt="Screen Shot 2022-12-13 at 5 10 51 PM" src="https://user-images.githubusercontent.com/91382964/207480309-c75c7a19-1a3c-4325-b761-c6d5e87b3c48.png">


### 🚀 Visit deployed your fullstack chat app https://proud-cell-8475.on.fleek.co/
