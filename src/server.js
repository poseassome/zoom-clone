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

function publicRooms() {
  // const sids = wsServer.sockets.adapter.sids;
  // const rooms = wsServer.sockets.adapter.rooms;
  // or
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;

  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) publicRooms.push(key);
  });
  return publicRooms;
}

function countRoom(roomName) {  // user 들어오고 나갈 때, count
  return wsServer.sockets.adapter.rooms.get(roomName).size;
}

wsServer.on("connection", socket => {
  // wsServer.socketsJoin("announcememt")  // ex) socket이 연결되었을 때, 모든 socket이 announcement에 입장하도록 함

  socket['nickname'] = 'Anon';

  socket.onAny((event) => {
    console.log(wsServer.sockets.adapter)
    console.log(`Socket Event: ${event}`);
  })

  socket.on("enter_room", (roomName, done) => {
    // console.log(socket.id)
    // console.log(socket.rooms) // 기본적으로 user와 서버 사이에 private room이 있고 그 room은 user id와 동일하다.
    socket.join(roomName);  // room에 들어가기
    // console.log(socket.rooms)
    done();
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));  // socket.io는 나를 제외한 모든 사람들에게 message를 보냄
    wsServer.sockets.emit("room_change", publicRooms());  // 모든 socket에 메세지를 보냄
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
    );
  });

  socket.on("disconnect", () => { // disconnecting 안에 작성하면 room은 존재하기때문에 동작하지 않음
    wsServer.sockets.emit("room_change", publicRooms());
  })

  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });

  socket.on("nickname", (nickname) => socket['nickname'] = nickname);
})

httpServer.listen(3000, handleListen); 