const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*', // Allow connections from any origin
  },
});

const PORT = process.env.PORT || 3000; // Use port from environment variable or 3000 by default

// List of channels (initially empty)
let channels = {}; // Store channels data

io.on('connection', (socket) => {
  console.log('User connected!');

  // Store the user's name for this socket
  socket.on('user name', (userName) => {
    socket.userName = userName; // Store the user's name in the socket object
    console.log(`User ${userName} joined the chat`);

    // Send "user name" event after processing the name
    io.to(socket.id).emit('user name', userName); // Send the userName back to the client
  });

  // Join a channel
  socket.on('join channel', (channelName, userId) => {
    // Add user to the channel if they are not already there
    if (!channels[channelName]) {
      channels[channelName] = { name: channelName, users: [], messages: [] }; // Create a new channel object if it doesn't exist
    }
    if (!channels[channelName].users.some(user => user.id === userId)) {
      channels[channelName].users.push({ id: userId, name: socket.userName }); // Add user to the channel's user list
    }
    // Join the socket to the room (channel)
    socket.join(channelName);

    // Send channel updated event to all users in the channel
    io.to(channelName).emit('channel updated', channels[channelName]);

    // Send all messages for the current channel to the user
    io.to(socket.id).emit('load messages', channels[channelName].messages);

    console.log(`User ${socket.userName} joined channel ${channelName}`);
  });

  // Send a message
  socket.on('send message', (message, channelName) => {
    const timestamp = Date.now();
    const newMessage = { user: socket.userName, text: message, timestamp }; // Create a new message object
    // Add the message to the channel's message list
    channels[channelName].messages.push(newMessage);
    // Send the message to all users in the channel
    io.to(channelName).emit('message', newMessage);
    console.log(`Message from ${socket.userName} in channel ${channelName}: ${message}`);
  });

  // Create a new channel
  socket.on('create channel', (channelName, userId) => {
    // Create a new channel
    const newChannel = { name: channelName, users: [], messages: [] }; // Create a new channel object
    // Add the new channel to the list of channels
    channels[channelName] = newChannel;

    // Send "channel created" event to all users
    io.emit('channel created', channelName);

    // Send "channel updated" event to all users in the channel
    io.to(channelName).emit('channel updated', newChannel);

    console.log(`Created new channel: ${channelName}`);
  });

  // Add a user to a channel
  socket.on('add user', (userName, channelName, userId) => {
    // Check if the channel exists
    if (!channels[channelName]) {
      channels[channelName] = { name: channelName, users: [] };
    }
    // Check if the user is already in the list
    if (!channels[channelName].users.some(user => user.id === userId)) {
      channels[channelName].users.push({ id: userId, name: userName }); // Add the user
      // Send "channel updated" event to all users in the channel
      io.to(channelName).emit('channel updated', channels[channelName]);
      // Send "user joined" event to the new user
      io.to(socket.id).emit('user joined', userName, userId); 
    }
    console.log(`User ${userName} added to channel ${channelName}`);
  });

  // Remove a user from a channel
  socket.on('remove user', (userIdToRemove, channelName, userId) => {
    if (channels[channelName]) {
      const userIndex = channels[channelName].users.findIndex(user => user.id === userIdToRemove);
      if (userIndex !== -1) {
        channels[channelName].users.splice(userIndex, 1);
        io.to(channelName).emit('channel updated', channels[channelName]);
      }
    }
  });

  // Leave a channel
  socket.on('leave channel', (channelName, userId) => {
    if (channels[channelName]) {
      // Remove the user from the user list, but don't remove the channel
      const userIndex = channels[channelName].users.findIndex(user => user.id === userId);
      if (userIndex !== -1) {
        channels[channelName].users.splice(userIndex, 1);
      }
      io.to(channelName).emit('channel updated', channels[channelName]);
    }
  });

  // User disconnects
  socket.on('disconnect', () => {
    console.log('User disconnected!');
    // Remove user from channels they were connected to
    for (const channelName in channels) {
      const index = channels[channelName].users.findIndex(user => user.id === socket.id);
      if (index !== -1) {
        channels[channelName].users.splice(index, 1);
        // Send "channel updated" event to all users in the channel
        io.to(channelName).emit('channel updated', channels[channelName]);
      }
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});