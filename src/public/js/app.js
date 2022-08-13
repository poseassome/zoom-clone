const socket = io();  // io Fn은 알아서 socket.io을 실행하고있는 서버를 찾을 것

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", { payload: input.value }, () => {
    console.log("server is done !");
  });
  input.value = '';
}

form.addEventListener("submit", handleRoomSubmit);