const socket = io();
socket.on('connect', () => {
  console.log(socket.id);
});

const changeImageInputEl = document.getElementById('changeImage');
const changeImageSelectEl = document.getElementById('second-minute-hour');

function configChange(val) {
  if (changeImageSelectEl.getElementsByTagName('option')[2].selected) {
    val = val * 3600000;
  } else if (changeImageSelectEl.getElementsByTagName('option')[1].selected) {
    val = val * 60000;
  } else if (changeImageSelectEl.getElementsByTagName('option')[0].selected) {
    val = val * 1000;
  }
  return val;
}

// kak rizal: pake debounce
changeImageInputEl.addEventListener('change', (e) => {
  console.log(e.target.value);

  socket.emit('ctrl', {
    cmd: 'imageChange',
    arg: configChange(e.target.value),
  });
});

changeImageSelectEl.addEventListener('change', (e) => {
  console.log(e);

  socket.emit('ctrl', {
    cmd: 'imageChange',
    arg: configChange(changeImageInputEl.value),
  });
});

function configApplier(config) {
  for (let key in config) {
    switch (key) {
      case 'imageChange':
        if (config.imageChange / 3600000 >= 1) {
          changeImageInputEl.value = config.imageChange / 3600000;
          changeImageSelectEl.getElementsByTagName('option')[2].selected =
            'selected';
        } else if (config.imageChange / 60000 >= 1) {
          changeImageInputEl.value = config.imageChange / 60000;
          changeImageSelectEl.getElementsByTagName('option')[1].selected =
            'selected';
        } else if (config.imageChange / 1000 >= 1) {
          changeImageInputEl.value = config.imageChange / 1000;
          changeImageSelectEl.getElementsByTagName('option')[0].selected =
            'selected';
        }
        break;
      default:
        break;
    }
  }
}

fetch('/api/config')
  .then(function (response) {
    if (response.status !== 200) {
      console.log(
        'Looks like there was a problem. Status Code: ' + response.status
      );
      return;
    }
    response.json().then(function (data) {
      console.log(data);
      configApplier(data);
    });
  })
  .catch(function (err) {
    console.log('Fetch Error :-S', err);
  });

socket.emit('this is controler');
socket.emit('controler active');

const randImgBtnEl = document.getElementById('randomImg');
const SolidBlackBtnEl = document.getElementById('solidBlack');

randImgBtnEl.addEventListener('click', (_) => {
  socket.emit('ctrl', { cmd: 'randomImg', arg: '' });
});
SolidBlackBtnEl.addEventListener('click', (_) => {
  socket.emit('ctrl', { cmd: 'solidBlack', arg: '' });
});
