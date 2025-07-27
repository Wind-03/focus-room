// socket.ts
import { io, Socket } from 'socket.io-client'
const URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

// TypeScript interfaces for type safety
export interface User {
  id: string      // UUID
  name: string    // Display name
  socketId: string // Socket connection ID
}
interface TimerState {
    startTime: number;
    elapsedTime: number;
    isActive: boolean;
  }
export interface ServerToClientEvents {
  'users-update': (users: User[]) => void
  'connect': () => void
  'disconnect': () => void
  'reconnect': () => void
  'timer:update': (timerState: TimerState) => void
}

export interface ClientToServerEvents {
  'user-join': (userData: { name: string; id: string }) => void
  'user-leave': () => void
  'timer:start': () => void
  'timer:stop': () => void
  'timer:reset': () => void
}

// Create socket connection
// This connects to your custom server running on port 3000
let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null

// Function to get or create socket connection
export const getSocket = (): Socket<ServerToClientEvents, ClientToServerEvents> => {
  if (!socket) {
    // Connect to your custom server
    socket = io(URL, {
      // Automatically try to reconnect if connection is lost
      autoConnect: true,
      // Retry connection attempts
      reconnection: true,
      // Wait 1 second between reconnection attempts
      reconnectionDelay: 1000,
      // Try up to 5 times
      reconnectionAttempts: 5
    })
    
    // Log connection events for debugging
    socket.on('connect', () => {
      console.log('Connected to socket server:', socket?.id)
    })
    
    socket.on('disconnect', () => {
      console.log('Disconnected from socket server:', socket?.id)
    })
    
    socket.on('reconnect', () => {
      console.log('Reconnected to socket server')
    })
  }
  
  return socket
}

// Clean up socket connection
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}