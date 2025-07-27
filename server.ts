// server.ts
import { createServer } from 'http'
import next from 'next'
import { Server } from 'socket.io'

const dev = process.env.NODE_ENV !== 'production'
const hostname = dev ? 'localhost' : '0.0.0.0'
const port = parseInt(process.env.PORT || '3000', 10)

// Don't pass port to Next.js app - let it handle its own routing
const app = next({ dev })
const handler = app.getRequestHandler()

interface User {
  id: string
  name: string
  socketId: string
}

const timerState = {
  startTime: 0,
  elapsedTime: 0, // To handle pausing
  isActive: false,
};

const activeUsers = new Map<string, User>()

function broadcastUserList(io: Server) {
  const userList = Array.from(activeUsers.values())
  io.emit('users-update', userList)
}

function removeUser(socketId: string, io: Server) {
  if (activeUsers.has(socketId)) {
    const user = activeUsers.get(socketId)!
    console.log(`User ${user.name} (${user.id}) disconnected`)
    activeUsers.delete(socketId)
    broadcastUserList(io)
  }
}

app.prepare().then(() => {
  const httpServer = createServer(handler)
  
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  })

  io.on('connection', (socket) => {
    console.log('New socket connection:', socket.id)
    
    
    socket.emit('timer:update', timerState);

    socket.on('user-join', (userData: { name: string; id: string }) => {
      console.log(`User ${userData.name} (${userData.id}) joined with socket ${socket.id}`)

      const newUser: User = {
        id: userData.id,
        name: userData.name,
        socketId: socket.id,
      }
      
      activeUsers.set(socket.id, newUser);
      broadcastUserList(io); 
    })

    // Add handlers for timer events from any client
    socket.on('timer:start', () => {
      if (!timerState.isActive) {
        timerState.isActive = true;
        timerState.startTime = Date.now(); 
        io.emit('timer:update', timerState); 
      }
    });

    socket.on('timer:stop', () => {
      if (timerState.isActive) {
        timerState.isActive = false;
        timerState.elapsedTime += (Date.now() - timerState.startTime);
        io.emit('timer:update', timerState); 
      }
    });

    socket.on('timer:reset', () => {
      timerState.isActive = false;
      timerState.startTime = 0;
      timerState.elapsedTime = 0;
      io.emit('timer:update', timerState); // Broadcast the new state to all
    });

    socket.on("user-leave", ()=>{
      removeUser(socket.id, io)
    })
    
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
      removeUser(socket.id, io)
    })
    
    socket.on('error', (error) => {
      console.error('Socket error:', error)
    })
  })

  httpServer.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log('> Socket.io server is running')
  })
})