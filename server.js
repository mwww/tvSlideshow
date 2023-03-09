// import { Server } from 'socket.io';
// const Server = require('socket.io');

const { createServer } = require('http');
const { Server } = require('socket.io');
const fs = require('fs').promises;

// const io = new Server(3000);

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
    .filter((item) => item); // remove empty entry
  // console.log(req.url, requrl);
  // console.log(req.socket.remoteAddress);
  let reqIP = req.socket.remoteAddress;
  const logger = (...messages) => {
    console.log(`[ ${reqIP} ] ${messages.join(' ')}`);
  };
  // console.log(requrl);
  logger(req.url);

  switch (requrl[0]) {
    case undefined:
      // =============
      // index handler
      // =============
      // logger('index');
      resRetFile(res, '/public/web/index.html', 'text/html');
      break;
    case 'control':
      // ==============
      // config handler
      // ==============
      // logger('config');
      resRetFile(res, '/public/web/control.html', 'text/html');
      break;
    case 'css':
      // ===========
      // css handler
      // ===========
      // logger('css');
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
      // logger('js');
      switch (requrl[1]) {
        case 'datetime.js':
          resRetFile(res, '/public/web/js/datetime.js', 'text/javascript');
          break;
        case 'configurator.js':
          resRetFile(res, '/public/web/js/configurator.js', 'text/javascript');
          break;
        default:
          res404(res);
      }
      break;
    case 'media':
      // =============
      // media handler
      // =============
      // logger('media');

      switch (requrl[1]) {
        case '1.jpg':
          resRetFile(res, '/public/assets/slideshow/1.jpg');
          break;
        default:
          res404(res);
      }
      break;
    default:
      logger(req.url, '404');
      res404(res);
  }

  // if (requrl[0] == undefined) {
  //   // ============
  //   // html handler
  //   // ============
  //   console.log('html');

  //   resRetFile(res, '/public/web/index.html', 'text/html');
  // } else if (requrl[0] == 'config') {
  //   // ==============
  //   // config handler
  //   // ==============
  //   console.log('css');
  //   resRetFile(res, '/public/web/config.html', 'text/html');
  // } else if (requrl[0] == 'css') {
  //   // ===========
  //   // css handler
  //   // ===========
  //   console.log('css');

  //   switch (requrl[1]) {
  //     case 'index.css':
  //       resRetFile(res, '/public/web/css/index.css', 'text/css');
  //       break;
  //     case 'base.css':
  //       resRetFile(res, '/public/web/css/base.css', 'text/css');
  //     default:
  //       break;
  //   }
  // } else if (requrl[0] == 'js') {
  //   // ==========
  //   // js handler
  //   // ==========
  //   console.log('js');

  //   switch (requrl[1]) {
  //     case 'datetime.js':
  //       resRetFile(res, '/public/web/js/datetime.js', 'texy/js');
  //       break;

  //     default:
  //       break;
  //   }
  // } else if (requrl[0] == 'media') {
  //   // =============
  //   // media handler
  //   // =============
  //   console.log('media');

  //   switch (requrl[1]) {
  //     case '1.jpg':
  //       resRetFile(res, '/public/assets/slideshow/1.jpg');
  //       break;

  //     default:
  //       break;
  //   }
  // } else {
  //   console.log('404');
  //   res.setHeader('Content-Type', 'text/html');
  //   res.writeHead(404);
  //   res.end(
  //     `<html><body><h1>Damn, that page is somehow missing!</h1></body></html>`
  //   );
  // }

  //   switch (req.url) {
  //     case '/':
  //       fs.readFile(__dirname + '/public/web/index.html')
  //         .then((contents) => {
  //           res.setHeader('Content-Type', 'text/html');
  //           res.writeHead(200);
  //           res.end(contents);
  //         })
  //         .catch((err) => {
  //           res.writeHead(500);
  //           res.end(err);
  //           return;
  //         });
  //       break;
  //     case '/css':
  //       console.log();
  //     default:
  //       res.setHeader('Content-Type', 'text/html');
  //       res.writeHead(404);
  //       res.end(
  //         `<html><body><h1>Damn, that page is somehow missing!</h1></body></html>`
  //       );
  //   }
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

const io = new Server(httpServer, {
  /* options */
});

let reloaded = [];

let clients = [];
let controlers = [];

io.on('connection', (socket) => {
  // console.log(
  //   `[ socket ] new connection from ${socket.handshake.address} with ID ${socket.id}`
  // );
  const logger = (message) => {
    console.log(`[ ${socket.id} ] ${message}`);
  };

  logger(`connected from ${socket.handshake.address}`);
  // send a message to the client
  // socket.emit('hello from server', 1, '2', { 3: Buffer.from([4]) });
  if (!reloaded.includes(socket.handshake.address)) {
    socket.emit('reload now');
    reloaded.push(socket.handshake.address);
  }

  socket.on('this is client', () => {
    clients.push(socket.id);
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
    controlers.forEach((controler) => {
      io.to(clients).emit('from server', `${socket.id} active`);
    });
  });

  // receive a message from the client
  socket.on('hello from client', (...args) => {
    logger(args);
    // ...
  });
});

// io.on('connection', (socket) => {
//   console.log(socket.id); // x8WIv7-mJelg7on_ALbx
// });
