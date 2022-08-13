const messageList = document.querySelector('ul');
const nicknameForm = document.querySelector('#nickname');
const messageForm = document.querySelector('#message');

const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) {
  const msg = { type, payload }
  return JSON.stringify(msg);
}

socket.addEventListener("open", () => {
  console.log("Connected to Server ✅");
});

socket.addEventListener("message", (message) => {
  const li = document.createElement('li');
  li.innerText = message.data;
  messageList.append(li);
})

socket.addEventListener("close", () => {
  console.log("Disconnected from Server ❌")
})

function handeleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector('input');
  // socket.send(input.value);
  socket.send(makeMessage("new_message", input.value));
  const li = document.createElement('li');
  li.innerText = `You: ${input.value}`;
  messageList.append(li);
  input.value = '';
}

function handeleNickSubmit(event) {
  event.preventDefault();
  const input = nicknameForm.querySelector('input');
  // socket.send(input.value);

  // JSON으로 보내기 
  socket.send(makeMessage("nickname", input.value));
}

messageForm.addEventListener("submit", handeleSubmit);
nicknameForm.addEventListener("submit", handeleNickSubmit);