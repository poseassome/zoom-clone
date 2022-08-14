const socket = io();  // io Fn은 알아서 socket.io을 실행하고있는 서버를 찾을 것

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

function backendDone(msg) {
  console.log("The backend says : ", msg);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, backendDone);
  input.value = '';
}

form.addEventListener("submit", handleRoomSubmit);