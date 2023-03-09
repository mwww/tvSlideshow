const socket = io();
socket.on('connect', () => {
  socket.emit('this is client');
});

socket.on('configuration', (config) => {});

let config = {
  imageChange: 5000,
};

function backgroundImageHandler() {
  const setBGIMG = setInterval(() => {}, 5000);
  // clearInterval(setBGIMG); // thanks @Luca D'Amico
}
