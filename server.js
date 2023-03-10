const { createServer } = require('http');
const { Server } = require('socket.io');
const fs = require('fs').promises;

// ------------------
// === http stuff ===
// ------------------

function res500(res, err) {
  res.writeHead(500);
  res.end(err);
  return;
}

function res404(res) {
  res.setHeader('Content-Type', 'text/html');
  res.writeHead(404);
  res.end(
    `<html><body><h1>Damn, that page is somehow missing!</h1></body></html>`
  );
}

function resRetCon(res, contents, contentType = '-') {
  if (contentType !== '' || contentType !== '-') {
    res.setHeader('Content-Type', contentType);
  }
  res.writeHead(200);
  res.end(contents);
}

function resRetFile(res, path, contentType = '-') {
  fs.readFile(__dirname + path)
    .then((contents) => {
      resRetCon(res, contents, contentType);
    })
    .catch((err) => {
      res500(res, err);
    });
}

const httpReq = (req, res) => {
  let requrl = String(req.url)
    .split('/')
    .filter((item) => item);
  let reqIP = req.socket.remoteAddress;
  const logger = (...messages) => {
    console.log(`[ ${reqIP} ] ${messages.join(' ')}`);
  };
  logger(req.url);

  switch (req.method) {
    case 'GET':
      switch (requrl[0]) {
        case undefined:
          // =============
          // index handler
          // =============
          resRetFile(res, '/public/web/index.html', 'text/html');
          break;
        case 'control':
          // ==============
          // config handler
          // ==============
          resRetFile(res, '/public/web/control.html', 'text/html');
          break;
        case 'css':
          // ===========
          // css handler
          // ===========
          switch (requrl[1]) {
            case 'base.css':
              resRetFile(res, '/public/web/css/base.css', 'text/css');
              break;
            case 'index.css':
              resRetFile(res, '/public/web/css/index.css', 'text/css');
              break;
            case 'control.css':
              resRetFile(res, '/public/web/css/control.css', 'text/css');
              break;
            default:
              res404(res);
          }
          break;
        case 'js':
          // ==========
          // js handler
          // ==========
          switch (requrl[1]) {
            case 'datetime.js':
              resRetFile(res, '/public/web/js/datetime.js', 'text/javascript');
              break;
            case 'configurator.js':
              resRetFile(
                res,
                '/public/web/js/configurator.js',
                'text/javascript'
              );
              break;
            case 'controller.js':
              resRetFile(
                res,
                '/public/web/js/controller.js',
                'text/javascript'
              );
              break;
            default:
              res404(res);
          }
          break;
        case 'media':
          switch (requrl[1]) {
            case 'slideshow':
              resRetFile(res, `/public/assets/slideshow/${requrl[2]}`);
              break;
            default:
              res404(res);
          }
          break;
        case 'api':
          switch (requrl[1]) {
            case 'config':
              resRetFile(res, '/clientConfig.json');
              break;
            case 'getAllImgs':
              // resRetFile(res, '/clientConfig.json');
              fs.readdir(__dirname + '/public/assets/slideshow/')
                .then((files) => {
                  res.writeHead(200);
                  res.end(JSON.stringify({ imgs: files }));
                })
                .catch((err) => {
                  console.error('err', err);
                });
              break;
            default:
              break;
          }
          break;
        default:
          logger(req.url, '404');
          res404(res);
      }
      break;
    case 'POST':
      res404(res);
    default:
      break;
  }
};

const httpServer = createServer(httpReq);
const host = '192.168.8.115';
const port = 8000;
httpServer.listen(port, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

// --------------------
// === socket stuff ===
// --------------------

const io = new Server(httpServer);

let reloaded = [];

let clients = [];
let controlers = [];

let clientsRandomImage = {};

io.on('connection', (socket) => {
  const logger = (message) => {
    console.log(`[ ${socket.id} ] ${message}`);
  };

  logger(`connected from ${socket.handshake.address}`);
  if (!reloaded.includes(socket.handshake.address)) {
    socket.emit('reload now');
    reloaded.push(socket.handshake.address);
  }

  socket.on('this is client', () => {
    clients.push(socket.id);
    clientsRandomImage[socket.id] = { imgs: [] };
    socket.emit('ctrl cmd', 'new config');
    console.log('clients', clients);
  });
  socket.on('this is controler', () => {
    controlers.push(socket.id);
    console.log('controlers', controlers);
  });

  socket.on('client active', () => {
    controlers.forEach((controler) => {
      io.to(controler).emit('from server', `${socket.id} active`);
    });
  });
  socket.on('controler active', () => {
    clients.forEach((client) => {
      io.to(client).emit('from server', `${socket.id} active`);
    });
  });

  socket.on('random img', () => {
    setTimeout(() => {
      fs.readdir(__dirname + '/public/assets/slideshow/')
        .then((files) => {
          let randomimg;
          let imgsList = clientsRandomImage[socket.id].imgs;
          let filesLen = files.length;
          let loops = 0;
          let maxLoops = 10;
          while (true) {
            randomimg = Math.floor(Math.random() * filesLen) + 1;
            let slices =
              filesLen == 2 || filesLen == 3
                ? -1
                : filesLen == 4
                ? -2
                : filesLen > 4 && filesLen <= 6
                ? -3
                : filesLen > 6
                ? -5
                : 1;
            imgsList = imgsList.slice(slices);
            if (!imgsList.includes(randomimg)) {
              break;
            }
            loops++;
            if (loops >= maxLoops) {
              break;
            }
          }
          socket.emit('res new img', `/media/slideshow/${randomimg}.jpg`);
          clientsRandomImage[socket.id].imgs.push(randomimg);
        })
        .catch((err) => {
          console.error('err', err);
        });
    }, 500);
  });

  socket.on('ctrl', (cmd) => {
    switch (cmd.cmd) {
      case 'imageChange':
        let configFile;
        fs.readFile(__dirname + '/clientConfig.json')
          .then((content) => {
            configFile = JSON.parse(content);
            logger(content);

            configFile.imageChange = cmd.arg;
            clients.forEach((client) => {
              io.to(client).emit('ctrl cmd', 'new config');
            });

            fs.writeFile(
              __dirname + '/clientConfig.json',
              JSON.stringify(configFile),
              'utf8'
            )
              .then(() => {
                logger('config saved successfully!');
              })
              .catch((err) => {
                logger(err);
              });
          })
          .catch((err) => {
            logger(err);
          });
        break;
      case 'randomImg':
        clients.forEach((client) => {
          io.to(client).emit('ctrl cmd', 'randomImg');
        });
        break;
      case 'solidBlack':
        clients.forEach((client) => {
          io.to(client).emit('ctrl cmd', 'solidBlack');
        });
        break;

      default:
        break;
    }
  });

  socket.on('hello from client', (...args) => {
    logger(args);
  });
});
