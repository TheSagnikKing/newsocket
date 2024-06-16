const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require("cors")
const socketIo = require('socket.io'); // Replace 'websocket' with 'socket.io'

const app = express();
app.use(express.json());

app.use(cors())

mongoose.connect('mongodb+srv://completeAuth123:completeAuth123@cluster0.8s87z6t.mongodb.net/queuesss');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const queueSchema = new mongoose.Schema({
  title: String,
  author: String,
});

const Queue = mongoose.model('queue', queueSchema);

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],  // Replace with your frontend URL
    methods: ["GET", "POST"]  // Specify the allowed methods
  }
}); // Initialize socket.io with the HTTP server

let clients = [];

// Function to broadcast data to all clients
function broadcastToClients(event, data) {
  io.emit(event, data); // Emits to all connected clients
}

io.on('connection', (socket) => {
  console.log('New client connected ', socket.id);
  clients.push(socket.id)

  const salonId = socket.handshake.query.salonId

  console.log(salonId)

  // Log all clients after a new client connects
  console.log("All Clients ", clients);

  // Example: Handling data sent from frontend to broadcast to all clients
  socket.on('sendDataToFrontend', (data) => {
    console.log('Received data from frontend:', data);
    broadcastToClients('broadcastData', data); // Broadcast data to all clients
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    clients = clients.filter(client => client !== socket);
  });

  // You can handle other events here
});


// Routes
app.get('/api/queuelist', async (req, res) => {
  try {
    const queuelist = await Queue.find({});
    res.json(queuelist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/addqueue', async (req, res) => {
  const queue = new Queue({
    title: req.body.title,
    author: req.body.author,
  });

  try {
    const newQueue = await queue.save();
    // // Emit event to all connected clients about the new queue
    io.emit('broadcastData', newQueue); // Example of emitting an event to all clients
    res.status(201).json(newQueue);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// this api is for when i want to send data to particular socket id

// app.post('/api/addqueue', async (req, res) => {

//   const salonId = req.body.salonId ata asche frontend theke

//   const queue = new Queue({
//     title: req.body.title,
//     author: req.body.author,
//   });

//   try {
//     const newQueue = await queue.save();

//     // Filter clients based on salonId
//     const clientsToSend = clients.filter(client => client.salonId === salonId);

//     // Emit event to selected clients
//     clientsToSend.forEach(client => {
//       io.to(client.id).emit('broadcastData', newQueue);
//     });

//     res.status(201).json(newQueue);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });


// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
