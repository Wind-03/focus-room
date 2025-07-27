// hooks/useFocusRoom.ts
import { useState, useEffect, useCallback } from 'react'
import { getSocket, disconnectSocket, User } from '../../lib/socket'

interface TimerState {
  startTime: number;
  elapsedTime: number;
  isActive: boolean;
}


export const useFocusRoom = (userName: string, userId: string) => {
  // State for tracking users in the focus room
  const [users, setUsers] = useState<User[]>([])
  const socket = getSocket()
  
  // State for tracking connection status
  const [isConnected, setIsConnected] = useState(false)
  
  // State for tracking if current user has joined
  const [hasJoined, setHasJoined] = useState(false)

  const [timerState, setTimerState] = useState<TimerState>({
    startTime: 0,
    elapsedTime: 0,
    isActive: false,
  });

  // Function to join the focus room
  const joinRoom = useCallback(() => {
  
    if (userName && userId) {
      console.log(`EMITTING 'user-join' with: ${userName}, ${userId}`);
      socket.emit('user-join', { name: userName, id: userId });
      setHasJoined(true);
    }

  }, [userName, userId, socket]);

  // Function to leave the focus room
  const leaveRoom = useCallback(() => {
    if (socket) { 
      socket.emit('user-leave');
      setHasJoined(false);
      console.log('Leaving room');
    }
  }, [socket]);

  // Set up socket listeners and cleanup
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return;
    
    // Listen for connection status changes
    const handleConnect = () => {
      console.log('Socket connected')
      setIsConnected(true)
      
      // If we were previously joined, rejoin (handles reconnections)
      if (hasJoined) {
        joinRoom()
      }
    }
    
    const handleDisconnect = () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    }
    
    // Listen for user list updates from server
    const handleUsersUpdate = (userList: User[]) => {
      console.log('Users updated:', userList)
      setUsers(userList)
    }
    
    // Set up event listeners
    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('users-update', handleUsersUpdate)
    socket.on('timer:update', (newTimerState: TimerState) => {
      setTimerState(newTimerState);
    });
    
    // Check if already connected
    if (socket.connected) {
      setIsConnected(true)
    }
    
    // Cleanup function - runs when component unmounts
    return () => {
      // Remove event listeners to prevent memory leaks
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('users-update', handleUsersUpdate)
      socket.off('timer:update', (newTimerState: TimerState) => {
        setTimerState(newTimerState);
      });
      
      // Leave room if we're currently joined
      // if (hasJoined) {
      //   socket.emit('user-leave')
      // }
    }
  }, [hasJoined, joinRoom, users]) // Dependencies: re-run if hasJoined or joinRoom changes

  // Auto-join when component mounts (if we have valid data)
  useEffect(() => {
    if (userName && userId && isConnected && !hasJoined) {
      joinRoom()
    }
  }, [userName, userId, isConnected, hasJoined, joinRoom])
  const startTimer = () => socket.emit('timer:start');
  const stopTimer = () => socket.emit('timer:stop');
  const resetTimer = () => socket.emit('timer:reset');

  return {
    timerState,      // Current timer state
    startTimer,      // Function to start the timer
    stopTimer,       // Function to stop the timer
    resetTimer,      // Function to reset the timer
    userId,          // Current user's ID
    users,           // Array of users in the room
    isConnected,     // Boolean: are we connected to server?
    hasJoined,       // Boolean: have we joined the room?
    joinRoom,        // Function: manually join the room
    leaveRoom        // Function: manually leave the room
  }
}



