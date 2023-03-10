const socket = io();
socket.on('connect', () => {
  socket.emit('this is client');
});

let config;

function configApplier(config) {
  for (let key in config) {
    switch (key) {
      case 'imageChange':
        backgroundImageHandler(config);
        break;
      default:
        break;
    }
  }
}

let setBGIMG;

function backgroundImageHandler(config) {
  socket.emit('random img');
  try {
    clearInterval(setBGIMG);
  } catch (err) {
    console.error(err);
  }
  setBGIMG = setInterval(() => {
    socket.emit('random img');
  }, config.imageChange);
}

socket.on('res new img', (url) => {
  const bgpicEl = document.getElementById('bgpic');
  bgpicEl.style.backgroundImage = `url(${url})`;
});

socket.on('ctrl cmd', (cmd) => {
  switch (cmd) {
    case 'randomImg':
      try {
        clearInterval(setBGIMG);
      } catch (err) {
        console.error(err);
      }
      socket.emit('random img');
      configApplier(config);
      break;
    case 'solidBlack':
      try {
        clearInterval(setBGIMG);
      } catch (err) {
        console.error(err);
      }
      const bgpicEl = document.getElementById('bgpic');
      bgpicEl.style.backgroundImage = '';
      bgpicEl.style.backgroundColor = `#000`;
      break;
    case 'new config':
      try {
        clearInterval(setBGIMG);
      } catch (err) {
        console.error(err);
      }
      fetch('/api/config')
        .then(function (response) {
          if (response.status !== 200) {
            console.error(
              'Looks like there was a problem. Status Code: ' + response.status
            );
            return;
          }
          response.json().then(function (data) {
            config = data;
            configApplier(data);
          });
        })
        .catch(function (err) {
          console.error('Fetch Error :-S', err);
        });
      break;
    default:
      break;
  }
});
