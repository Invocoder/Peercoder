const express = require('express')

const app = express();

const http = require('http');

const path = require('path');

const {Server} = require('socket.io');

const server = http.createServer(app);

const io = new Server(server);

const ACTIONS = require('./src/Actions');

app.use(express.static('build'));

app.use((req, res, next)=>{
   res.sendFile(path.join(__dirname, 'build', 'index.html'));
})

const userSocketMap = {};
function getAllConnectedClients(roomId){

  //Map
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
  }
  
  );
}

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  //listenn on server

  socket.on(ACTIONS.JOIN, ({roomId, username}) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({socketId}) => {
        io.to(socketId).emit(ACTIONS.JOINED ,{
          clients,
          username,
          socketId: socket.id,
        });

    });
  });
  

  socket.on(ACTIONS.CODE_CHANGE, ({roomId, code}) => {
    // console.log('receinving', code);
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  })

  socket.on(ACTIONS.SYNC_CODE, ({socketId, code}) => {
    // console.log('receinving', code);
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });


  socket.on('disconnecting', () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED,{
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
      socket.leave();
    });
    delete userSocketMap[socket.id];
   
  });
});

// Your code
if (process.env.NODE_ENV === "production") {
  const path = require("path");
  app.use(express.static(path.resolve(__dirname, 'client', 'build')));
  app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'),function (err) {
          if(err) {
              res.status(500).send(err)
          }
      });
  })
}
// Your code


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
