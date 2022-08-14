import http from "http";
// import WebSocket from "ws";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"))

const handleListen = () => console.log(`Listening on http://localhost:3000`);
// app.listen(3000, handleListen);

/*****
 * ws 사용
 
  // server에 httmp, ws 둘 다 동작
  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server });

  function onSocketClose() {
    console.log("Disconnected from Browser ❌");
  }

  // fake Database
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
                                          *****/


const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

// http://localhost:3000/socket.io/socket.io.js
// socket.io는 webSocket의 부가기능이 아님. websocket을 지원하지않으면 socket.io는 다른 방법으로 재연결을 시도할 것
// Front-end에도 socket.io 설치 필요

wsServer.on("connection", socket => {
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  })

  socket.on("enter_room", (roomName, done) => {
    // console.log(socket.id)
    // console.log(socket.rooms) // 기본적으로 user와 서버 사이에 private room이 있고 그 room은 user id와 동일하다.
    socket.join(roomName);  // room에 들어가기
    // console.log(socket.rooms)
    done();
  });
})

httpServer.listen(3000, handleListen); 