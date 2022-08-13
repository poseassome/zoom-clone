import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"))

const handleListen = () => console.log(`Listening on http://localhost:3000`);
// app.listen(3000, handleListen);


/**  server에 httmp, ws 둘 다 동작  **/
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function onSocketClose() {
  console.log("Disconnected from Browser ❌");
}

/* fake Database */
const sockets = []; //  <-- 접속하는 브라우저의 정보를 담음

wss.on("connection", (socket) => {
  sockets.push(socket);
  socket['nickname'] = 'Anon';
  console.log("Connected to Browser ✅");
  socket.on("close", onSocketClose);
  socket.on("message", (msg) => {
    const message = JSON.parse(msg);
    // if (message.type === 'new_message') sockets.forEach((aSocket) => aSocket.send(message.payload));
    // else if (message.type === 'nickname') console.log(message.payload);
    switch (message.type) {
      case "new_message":
        sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${message.payload}`));
        break;
      case "nickname":
        socket['nickname'] = message.payload;
        break;
    }
  })
})

server.listen(3000, handleListen);

/* type 정해주기

  {
    type: 'message',
    payload: 'hello'
  }
  {
    type: 'nickname',
    payload: 'nick'
  }
                    */