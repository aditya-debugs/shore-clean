# ShoreClean Community Chat Feature

A complete real-time chat system for the ShoreClean coastal cleanup platform, built with React, Socket.io, and MongoDB.

## ✨ Features

### 🎯 **Core Chat Functionality**

- ✅ Real-time messaging with Socket.io
- ✅ Organization and event-specific chat rooms
- ✅ Message persistence with MongoDB
- ✅ User authentication and authorization
- ✅ Responsive design matching ShoreClean's theme

### 🚀 **Advanced Features**

- ✅ Online presence indicators
- ✅ Typing indicators
- ✅ Message read receipts
- ✅ Auto-scroll to latest messages
- ✅ Emoji support and quick reactions
- ✅ Date-based message grouping
- ✅ Connection status monitoring

### 🎨 **UI/UX**

- ✅ Clean, modern design matching ShoreClean's branding
- ✅ Soft blue (#00AEEF) and teal-green color scheme
- ✅ Rounded cards (2xl radius) and soft shadows
- ✅ Mobile-first responsive design
- ✅ WhatsApp/Slack-inspired chat bubbles

## 📁 Project Structure

```
shore-clean/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── OnlineUsersList.jsx
│   │   │   └── TypingIndicator.jsx
│   │   ├── hooks/             # Custom React hooks
│   │   │   └── useSocket.js   # WebSocket connection hook
│   │   ├── pages/             # Page components
│   │   │   └── ChatCommunity.jsx
│   │   ├── utils/             # Utility functions
│   │   │   └── api.js         # API client functions
│   │   └── App.jsx            # Main app component
│   └── package.json
└── server/                     # Node.js Backend
    ├── src/
    │   ├── controllers/       # Route handlers
    │   │   └── chatController.js
    │   ├── models/           # MongoDB schemas
    │   │   └── Chat.js       # Chat message model
    │   ├── routes/           # API routes
    │   │   └── chatRoutes.js
    │   ├── utils/            # Server utilities
    │   │   └── socketHandler.js # Socket.io event handlers
    │   └── index.js          # Server entry point
    └── package.json
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### 1. Backend Setup

```bash
cd server
npm install

# Add these dependencies to package.json if not present:
npm install socket.io express mongoose cors dotenv
```

Create `.env` file in server directory:

```env
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/shoreclean
JWT_SECRET=your_jwt_secret_here
```

### 2. Frontend Setup

```bash
cd client
npm install

# Add these dependencies if not present:
npm install socket.io-client axios react-router-dom
```

Create `.env` file in client directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Database Setup

Ensure MongoDB is running locally or provide a cloud connection string in your `.env` file.

The Chat model will be automatically created when the server starts.

## 🚀 Running the Application

### Start Backend Server

```bash
cd server
npm run dev  # or npm start
```

Server will run on `http://localhost:5000`

### Start Frontend Development Server

```bash
cd client
npm run dev
```

Frontend will run on `http://localhost:3000`

## 📡 API Endpoints

### Chat REST API

- `GET /api/chat/:orgId` - Get organization chat messages
- `GET /api/chat/:orgId/:eventId` - Get event-specific chat messages

### WebSocket Events

#### Client → Server

- `join_room` - Join a chat room
- `send_message` - Send a new message
- `typing` - Start typing indicator
- `stop_typing` - Stop typing indicator
- `update_status` - Update online status
- `message_read` - Mark message as read

#### Server → Client

- `receive_message` - New message received
- `message_history` - Load previous messages
- `user_typing` - User started typing
- `user_stopped_typing` - User stopped typing
- `user_joined` - User joined room
- `user_left` - User left room
- `room_users` - Updated list of online users
- `error` - Error occurred

## 🎨 Styling Guidelines

The chat interface follows ShoreClean's design system:

### Colors

- **Primary Blue**: `#00AEEF` / `rgb(0, 174, 239)`
- **Teal Accent**: `#20B2AA` / `rgb(32, 178, 170)`
- **Background**: Gradient from `blue-50` to `teal-50`
- **Text**: `gray-900` for headings, `gray-600` for body

### Components

- **Cards**: `rounded-2xl` with `shadow-xl`
- **Buttons**: Gradient backgrounds with hover effects
- **Messages**: Different styles for sender vs. receiver
- **Inputs**: `rounded-xl` with focus states

## 🔧 Key Features Implementation

### Real-time Messaging

```javascript
// Client-side message sending
const sendMessage = (messageText) => {
  socket.emit("send_message", {
    orgId,
    eventId,
    userId: user.id,
    username: user.name,
    message: messageText,
    timestamp: new Date(),
  });
};

// Server-side message handling
socket.on("send_message", async (data) => {
  const savedMessage = await saveMessage(
    data.orgId,
    data.eventId,
    data.userId,
    data.message
  );
  io.to(roomId).emit("receive_message", savedMessage.data);
});
```

### Room Management

- Users join rooms based on `orgId_eventId` pattern
- Organization-wide rooms use `orgId_general`
- Automatic cleanup of empty rooms
- User presence tracking

### Message Persistence

- All messages saved to MongoDB
- Automatic pagination for chat history
- Message metadata (timestamps, read status)
- Support for different message types

## 🧪 Testing

### Manual Testing Checklist

- [ ] Join event-specific chat room
- [ ] Join organization-wide chat room
- [ ] Send and receive messages in real-time
- [ ] Typing indicators work
- [ ] Online presence updates
- [ ] Message history loads correctly
- [ ] Auto-scroll functionality
- [ ] Mobile responsive design
- [ ] Connection error handling

### Testing Multiple Users

1. Open multiple browser tabs/windows
2. Join the same chat room
3. Send messages from different tabs
4. Verify real-time updates across all instances

## 🚀 Deployment

### Backend Deployment

1. Set production environment variables
2. Use process manager (PM2) for Node.js
3. Configure reverse proxy (Nginx)
4. Enable HTTPS and WSS

### Frontend Deployment

1. Build production bundle: `npm run build`
2. Deploy to static hosting (Vercel, Netlify)
3. Update environment variables for production

## 🤝 Integration with Existing ShoreClean App

### Authentication Integration

Replace mock user data with actual auth context:

```javascript
// In ChatCommunity.jsx
import { useAuth } from "../context/AuthContext";

const ChatCommunity = () => {
  const { user } = useAuth();
  // Use real user data instead of mockUser
};
```

### Navigation Integration

Add chat routes to your existing router:

```javascript
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatCommunity from "./pages/ChatCommunity";

// Add to your routes
<Route path="/chat/:orgId/:eventId?" element={<ChatCommunity />} />;
```

## 📝 Todo / Future Enhancements

- [ ] File/image upload support
- [ ] Message reactions (👍, ❤️, etc.)
- [ ] Reply/thread functionality
- [ ] User mention system (@username)
- [ ] Message search functionality
- [ ] Push notifications
- [ ] Voice messages
- [ ] Admin moderation tools
- [ ] Message encryption
- [ ] Chat backups/exports

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**

   - Check CORS settings in server
   - Verify Socket.io version compatibility
   - Ensure firewall allows WebSocket connections

2. **Messages Not Saving**

   - Check MongoDB connection
   - Verify Chat model schema
   - Check authentication middleware

3. **Styling Issues**
   - Ensure Tailwind CSS is properly configured
   - Check for class name conflicts
   - Verify responsive breakpoints

## 📄 License

This project is part of the ShoreClean platform. See the main project for license information.

---

Built with ❤️ for protecting our coastal heritage 🌊
