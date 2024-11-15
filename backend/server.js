

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Allow all origins (you can restrict this to specific origins)
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  },
});

const cardDeck = [
  '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', '10H', 'JH', 'QH', 'KH', 'AH',
  '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', '10D', 'JD', 'QD', 'KD', 'AD',
  '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', '10C', 'JC', 'QC', 'KC', 'AC',
  '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', '10S', 'JS', 'QS', 'KS', 'AS'
];

// Allow all origins (can be restricted based on your needs)
app.use(cors());

// Store rooms and users
let rooms = {}; // Store room info (e.g., users, creator, chat history)

// Serve static files (optional, for production)
app.use(express.static('public'));

// API to check room status
app.get('/api/rooms/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  if (rooms[roomId]) {
    res.json(rooms[roomId]);
  } else {
    res.status(404).json({ message: 'Room not found' });
  }
});

// Socket.io handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // User joins a room
  socket.on('join-room', (data) => {
    const { roomId, username, pfpUrl } = data;

    // Check if room exists or create it
    if (!rooms[roomId]) {
      rooms[roomId] = {
        users: [],
        creator: socket.id, // Set the creator of the room
        chatHistory: [] // Store the chat history
      };
    }

    // Add user to the room
    rooms[roomId].users.push({ username, pfpUrl, socketId: socket.id });

    // Join the room in socket.io
    socket.join(roomId);

    // Emit the updated list of users in the room
    io.to(roomId).emit('room-update', rooms[roomId].users);
  });

  socket.on('send-message', (data) => {
    const { roomId, message, username , pfpUrl } = data;

    if (rooms[roomId]) {
      // Add message to chat history with username
      rooms[roomId].chatHistory.push({ username, pfpUrl ,  message });

      // Emit the message to all users in the room
      io.to(roomId).emit('chat-message', { username, pfpUrl ,message });
    }
  });

  // Start the game
  socket.on('start-game', (roomId) => {
    if (rooms[roomId] && rooms[roomId].creator === socket.id) {
      // Shuffle the deck and deal cards
      const shuffledDeck = shuffleDeck([...cardDeck]);
      const users = rooms[roomId].users;

      // Deal 5 cards to each user and track remaining cards
      const hands = dealCards(shuffledDeck, users.length, roomId);

      // Assign cards to each user and send it to them
      users.forEach((user, index) => {
        io.to(user.socketId).emit('deal-cards', hands[index]);
      });

      // Choose a random suit for the game
      const suits = ['H', 'D', 'C', 'S'];
      const randomSuit = suits[Math.floor(Math.random() * suits.length)];

      // Emit the random suit to all players
      io.to(roomId).emit('random-suit', randomSuit);

      // Notify all users that the game has started
      io.to(roomId).emit('game-started', 'The game has started!');
    }
  });

  function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap elements
    }
    return deck;
  }

  function dealCards(deck, numberOfPlayers, roomId) {
    let hands = [];
    let currentCard = 0;

    for (let i = 0; i < numberOfPlayers; i++) {
      hands.push(deck.slice(currentCard, currentCard + 5)); // Deal 5 cards to each player
      currentCard += 5;
    }

    // Store the remaining deck in the room
    rooms[roomId].deck = deck.slice(currentCard);
    return hands;
  }

  // Handle user disconnect
  socket.on('disconnect', () => {
    Object.keys(rooms).forEach((roomId) => {
      rooms[roomId].users = rooms[roomId].users.filter((user) => user.socketId !== socket.id);
      io.to(roomId).emit('room-update', rooms[roomId].users);
    });
  });
});

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
