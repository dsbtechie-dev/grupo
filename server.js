const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS settings
const io = socketIo(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Serve static files from a 'public' directory
app.use(express.static('public'));

let clients = [];

io.on('connection', (socket) => {
  // Register the client 
  socket.on('register-client', (client = {}) => {
    client.sid = socket.id;
    const registered = clients.find(c => c.uid === client.uid);
    
    if (registered) {
      clients = clients.filter(c => c.email !== registered.email);
    }
    
    clients.push(client);
    socket.join(client.uid);
    console.log(`Client registered: ${client.uid}`);
  });
  
  socket.on('message-client', (message = {}) => {
    const { to } = message;
    io.to(to).emit('client_message', message);
  });    
    
  // Disconnection
  socket.on('disconnect', () => {
    const registered = clients.find(c => c.sid === socket.id);
    if (registered) {
      clients = clients.filter(c => c.sid !== socket.id);
      console.log(`Client disconnected: ${registered.uid}`);
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

});
