import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Chat from './Chat';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState(null); // Unique ID for the user
  const [userName, setUserName] = useState(''); // Username for the user
  const [currentChannel, setCurrentChannel] = useState(null); // Currently selected channel
  const [newUserToAdd, setNewUserToAdd] = useState(''); // New user to add to a channel

  useEffect(() => {
    const newSocket = io('http://localhost:3000'); // Connect to the server
    setSocket(newSocket);

    // Generate a random unique ID for the user
    const newUserId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setUserId(newUserId);

    // Listen for "user name" event from the server
    newSocket.on('user name', (receivedUserName) => {
      setUserName(receivedUserName);
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div className="app-container">
      <h1>Chat App</h1>

      {/* Form for entering a username */}
      {!userName && (
        <form onSubmit={(e) => {
          e.preventDefault();
          socket.emit('user name', userName);
        }}>
          <input
            type="text"
            placeholder="Enter your username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <button type="submit">Join Chat</button>
        </form>
      )}

      {/* Chat component */}
      {userName && (
        <Chat
          socket={socket}
          channelName={currentChannel} // Pass the current channel name to the Chat component
          userId={userId} // Pass the user ID to the Chat component
          userName={userName} // Pass the username to the Chat component
          setCurrentChannel={setCurrentChannel} // Function to update the current channel
          newUserToAdd={newUserToAdd} // Pass the new user to add to the Chat component
          setNewUserToAdd={setNewUserToAdd} // Function to update the new user to add
        />
      )}
    </div>
  );
};

export default App;