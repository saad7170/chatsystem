# Quick Setup Guide

## Step 1: Prerequisites

Before starting, make sure you have installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Postman** (optional, for API testing) - [Download](https://www.postman.com/downloads/)

## Step 2: Verify Installation

Check if Node.js and npm are installed:

```bash
node --version
npm --version
```

Check if MongoDB is installed (if using local):

```bash
mongod --version
```

## Step 3: Install Dependencies

All dependencies are already installed. If you need to reinstall:

```bash
npm install
```

## Step 4: Configure MongoDB

### Option A: Local MongoDB

1. Start MongoDB service:
   ```bash
   # On Windows (as administrator)
   net start MongoDB

   # On macOS/Linux
   sudo systemctl start mongod
   # or
   sudo service mongod start
   ```

2. Your `.env` file should have:
   ```env
   MONGODB_URI=mongodb://localhost:27017/chat-app
   ```

### Option B: MongoDB Atlas (Cloud - Recommended)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Update `.env` file:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chat-app
   ```

## Step 5: Configure Environment Variables

Open the `.env` file and update:

```env
# Change this to a strong random string
JWT_SECRET=your-super-secret-jwt-key-12345

# If you're building a frontend, update this
CLIENT_URL=http://localhost:5173
```

## Step 6: Start the Server

Development mode (with auto-reload):

```bash
npm run dev
```

You should see:
```
MongoDB Connected: ...
Server running in development mode on port 5000
```

## Step 7: Test the API

### Test 1: Health Check

Open your browser and go to:
```
http://localhost:5000/health
```

You should see:
```json
{
  "success": true,
  "message": "Server is running"
}
```

### Test 2: Register a User (using Postman or curl)

**Using Postman:**
1. Open Postman
2. Create a new POST request
3. URL: `http://localhost:5000/api/auth/register`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```
6. Click "Send"

**Using curl:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

You should receive a response with a token:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "avatar": "https://via.placeholder.com/150",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Test 3: Login

POST to `http://localhost:5000/api/auth/login`

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

Save the `token` from the response - you'll need it for authenticated requests.

### Test 4: Get Current User (Protected Route)

GET to `http://localhost:5000/api/auth/me`

Add header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

## Step 8: Common Issues & Solutions

### Issue 1: MongoDB Connection Failed

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:27017`

**Solution:**
- Make sure MongoDB is running: `sudo systemctl status mongod`
- Start MongoDB: `sudo systemctl start mongod`
- Or use MongoDB Atlas instead

### Issue 2: Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
- Change PORT in `.env` file to a different port (e.g., 5001)
- Or kill the process using port 5000:
  ```bash
  # On Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F

  # On macOS/Linux
  lsof -ti:5000 | xargs kill -9
  ```

### Issue 3: JWT Secret Error

**Error:** `secretOrPrivateKey must have a value`

**Solution:**
- Make sure you have set `JWT_SECRET` in your `.env` file
- Restart the server after changing `.env`

### Issue 4: Module Not Found

**Error:** `Error: Cannot find module 'express'`

**Solution:**
- Run `npm install` to install all dependencies
- Make sure you're in the correct directory

## Step 9: Testing Real-time Features (Socket.IO)

To test Socket.IO events, you have two options:

### Option A: Use Socket.IO Client Tool

1. Go to [Socket.IO Client Tool](https://amritb.github.io/socketio-client-tool/)
2. Enter socket URL: `http://localhost:5000`
3. Click "Connect"
4. Test events like `user:online`, `message:send`, etc.

### Option B: Create a Simple HTML Client

Create `test-socket.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Socket.IO Test</title>
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
</head>
<body>
  <h1>Socket.IO Test Client</h1>
  <button onclick="connect()">Connect</button>
  <button onclick="sendMessage()">Send Test Message</button>
  <div id="messages"></div>

  <script>
    let socket;
    const userId = '123'; // Replace with actual user ID

    function connect() {
      socket = io('http://localhost:5000');

      socket.on('connect', () => {
        console.log('Connected:', socket.id);
        socket.emit('user:online', userId);
        document.getElementById('messages').innerHTML += '<p>Connected!</p>';
      });

      socket.on('message:receive', (msg) => {
        console.log('Message received:', msg);
        document.getElementById('messages').innerHTML +=
          `<p>Message: ${msg.content}</p>`;
      });
    }

    function sendMessage() {
      socket.emit('message:send', {
        conversationId: 'test-conv-id',
        senderId: userId,
        content: 'Test message from HTML client',
        type: 'text'
      });
    }
  </script>
</body>
</html>
```

Open this file in your browser to test Socket.IO.

## Step 10: Next Steps

Now that your backend is running:

1. **Test all API endpoints** using the examples in [README.md](README.md)
2. **Create multiple users** to test conversations
3. **Test Socket.IO events** for real-time functionality
4. **Build a frontend** to connect to this backend
5. **Deploy to production** when ready

## Development Workflow

```bash
# Start the server in development mode
npm run dev

# The server will auto-reload when you make changes to files
# Press Ctrl+C to stop the server
```

## Production Deployment

When you're ready to deploy:

1. Update `.env`:
   ```env
   NODE_ENV=production
   MONGODB_URI=your-production-mongodb-uri
   JWT_SECRET=strong-random-secret
   CLIENT_URL=your-frontend-url
   ```

2. Start with:
   ```bash
   npm start
   ```

## Useful Commands

```bash
# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# Start production server
npm start

# Check MongoDB status
sudo systemctl status mongod

# View logs (if running as service)
tail -f /var/log/mongodb/mongod.log
```

## Getting Help

If you encounter issues:

1. Check the console for error messages
2. Verify MongoDB is running
3. Check `.env` configuration
4. Review the [README.md](README.md) for API documentation
5. Open an issue on GitHub

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [JWT Documentation](https://jwt.io/)
- [Mongoose Documentation](https://mongoosejs.com/)

Happy coding!
