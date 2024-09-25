// server.js
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
   origin: '*'
  },
});


// Middleware
app.use(cors());
app.use(express.json());

// Serve static files if needed
app.use(express.static(path.join(__dirname, 'public')));

// Add a basic route for the root URL
app.get('/', (req, res) => {
  res.send('Socket.IO server is running');
});

// MongoDB connection (using Atlas)
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Define MongoDB Schemas and Models
const messageSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

// Socket.IO communication
io.on('connection', (socket) => {
  console.log('New client connected', socket.id);

  // When a user joins a room
  socket.on('joinRoom', ({ sender, receiver }) => {
    const room = [sender, receiver].sort().join('-');
    socket.join(room);
    console.log(`${sender} joined room ${room}`);
  });

  // When a message is sent
  socket.on('sendMessage', async ({ sender, receiver, message }) => {
    const room = [sender, receiver].sort().join('-');
    const newMessage = new Message({ sender, receiver, message });
    await newMessage.save();
    
    // Emit message to both sender and receiver
    io.to(room).emit('receiveMessage', newMessage);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// API routes
app.get('/messages/:sender/:receiver', async (req, res) => {
  const { sender, receiver } = req.params;
  const room = [sender, receiver].sort();
  const messages = await Message.find({
    $or: [
      { sender: room[0], receiver: room[1] },
      { sender: room[1], receiver: room[0] },
    ],
  }).sort({ timestamp: 1 });
  res.json(messages);
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
