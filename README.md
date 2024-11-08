# Real-Time Chat Application

This is a simple real-time chat application built with React and Socket.io.

## Features

- **Real-time chat:** Users can chat with each other in real-time.
- **Channel creation:** Users can create new channels to organize their conversations.
- **User management:**  
    -  Users can join channels.
    -  Users can be removed from channels (by the channel creator or other admins).
    -  Users can leave channels.
- **Simple UI:**  A user-friendly interface for chatting.

## Installation and Running

1. **Install Node.js:** If you haven't already, install Node.js from [https://nodejs.org/](https://nodejs.org/).
2. **Clone this repository:** 
   ```bash
Navigate to the project directory:
cd chat-app
Install dependencies:
npm install
Start the server:
npm run start
Open a web browser and navigate to: http://localhost:3000
Usage
Enter a username: When you first open the application, you’ll be prompted to enter a username.
Join or create a channel:
Join existing channels: Select a channel from the list to join.
Create a new channel: Enter a channel name in the “Create channel” field and click “Create”.
Chat: Send messages in the chat window.
Manage users:
Add a user: Enter a username in the “Add user” field and click “Add”.
Remove a user: Click the “Remove” button next to the user’s name.
Leave a channel: Click the “Leave Channel” button at the top.
Development
Server: server.js (uses Socket.io)
Frontend: App.js, Chat.js (uses React)
Contributing
Contributions are welcome! Feel free to open issues or pull requests.
