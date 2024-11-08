import React, { useState, useEffect } from 'react';

const Chat = ({ socket, channelName, userId, userName, setCurrentChannel, newUserToAdd, setNewUserToAdd }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [usersInChannel, setUsersInChannel] = useState([]);
  const [showLeaveButton, setShowLeaveButton] = useState(false);

  useEffect(() => {
    // Join the channel
    if (socket && channelName) {
      socket.emit('join channel', channelName, userId);
    }

    // Get the list of users in the channel
    if (socket) {
      socket.on('channel updated', (updatedChannel) => {
        setUsersInChannel(updatedChannel.users);
      });
    }

    // Handle "message" event
    if (socket) {
      socket.on('message', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
    }

    // Handle "load messages" event
    if (socket) {
      socket.on('load messages', (messagesFromChannel) => {
        setMessages(messagesFromChannel);
      });
    }

    // Handle "user joined" event
    if (socket) {
      socket.on('user joined', (joinedUserName, joinedUserId) => {
        setUsersInChannel((prevUsers) => [...prevUsers, { id: joinedUserId, name: joinedUserName }]);
      });
    }

    // Clean up event handlers when the component unmounts
    return () => {
      if (socket) {
        socket.off('channel updated');
        socket.off('message');
        socket.off('load messages');
        socket.off('user joined');
      }
    };
  }, [socket, channelName, userId, userName]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() !== '' && socket) {
      socket.emit('send message', newMessage, channelName);
      setNewMessage('');
    }
  };

  const handleAddUser = () => {
    if (newUserToAdd.trim() !== '' && !usersInChannel.some((user) => user.name === newUserToAdd) && socket) {
      socket.emit('add user', newUserToAdd, channelName, userId);
      setUsersInChannel((prevUsers) => [...prevUsers, { id: userId, name: newUserToAdd }]);
      setNewUserToAdd('');
    }
  };

  // Function to remove a user from the channel
  const handleRemoveUser = (userIdToRemove) => {
    if (socket) {
      socket.emit('remove user', userIdToRemove, channelName, userId);
    }
  };

  // Function to leave the channel
  const handleLeaveChannel = () => {
    if (socket) {
      socket.emit('leave channel', channelName, userId);
    }
    setCurrentChannel(null);
  };

  // Set showLeaveButton to true if channelName is not empty
  useEffect(() => {
    if (channelName) {
      setShowLeaveButton(true);
    }
  }, [channelName]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>{channelName}</h2>
        {/* Conditional rendering of the "Leave Channel" button */}
        {showLeaveButton && (
          <button className="btn-leave" onClick={handleLeaveChannel}>Leave Channel</button>
        )}
      </div>

      <div className="chat-content">
        <ul className="chat-messages">
          {messages.map((message, index) => (
            <li key={index} className={message.user === userName ? 'own-message' : ''}>
              <span className="user">{message.user}: </span>
              <span className="message">{message.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="chat-input">
        <form className="send-message-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Enter message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="input-field"
          />
          <button type="submit" className="send-button">Send</button>
        </form>
      </div>

      <div className="chat-sidebar">
        <div className="users-list">
          <h3>Users:</h3>
          <ul>
            {usersInChannel.map((user, index) => (
              <li key={index}>
                {user.name}
                {/* Button to remove a user, only if it's not the current user */}
                {user.id !== userId && (
                  <button onClick={() => handleRemoveUser(user.id)}>Remove</button>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="add-user-form">
          <h3>Add user:</h3>
          <input
            type="text"
            placeholder="Username"
            value={newUserToAdd}
            onChange={(e) => setNewUserToAdd(e.target.value)}
          />
          <button onClick={handleAddUser}>Add</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;