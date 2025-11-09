import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../config/app.config';

interface WebSocketContextType {
  socket: Socket | null;
  connected: boolean;
  subscribeToSession: (sessionId: string) => void;
  unsubscribeFromSession: (sessionId: string) => void;
  onAttendanceUpdate: (callback: (data: any) => void) => void;
  onSessionStatsUpdate: (callback: (data: any) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
  url?: string;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ 
  children, 
  url = APP_CONFIG.websocket.url 
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const attendanceCallbacksRef = useRef<Array<(data: any) => void>>([]);
  const sessionStatsCallbacksRef = useRef<Array<(data: any) => void>>([]);

  useEffect(() => {
    initializeSocket();
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const initializeSocket = async () => {
    try {
      const token = await AsyncStorage.getItem('@attendance_token');
      if (!token) return;

      const newSocket = io(url, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        console.log('WebSocket connected');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        setConnected(false);
      });

      newSocket.on('error', (error: any) => {
        console.error('WebSocket error:', error);
      });

      // Listen for attendance updates
      newSocket.on('attendance:updated', (data: any) => {
        attendanceCallbacksRef.current.forEach((callback) => callback(data));
      });

      // Listen for session stats updates
      newSocket.on('session:stats', (data: any) => {
        sessionStatsCallbacksRef.current.forEach((callback) => callback(data));
      });

      setSocket(newSocket);
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  };

  const subscribeToSession = (sessionId: string) => {
    if (socket && connected) {
      socket.emit('subscribe:session', { sessionId });
      console.log(`Subscribed to session: ${sessionId}`);
    }
  };

  const unsubscribeFromSession = (sessionId: string) => {
    if (socket && connected) {
      socket.emit('unsubscribe:session', { sessionId });
      console.log(`Unsubscribed from session: ${sessionId}`);
    }
  };

  const onAttendanceUpdate = (callback: (data: any) => void) => {
    attendanceCallbacksRef.current.push(callback);
    return () => {
      attendanceCallbacksRef.current = attendanceCallbacksRef.current.filter(
        (cb) => cb !== callback
      );
    };
  };

  const onSessionStatsUpdate = (callback: (data: any) => void) => {
    sessionStatsCallbacksRef.current.push(callback);
    return () => {
      sessionStatsCallbacksRef.current = sessionStatsCallbacksRef.current.filter(
        (cb) => cb !== callback
      );
    };
  };

  const value: WebSocketContextType = {
    socket,
    connected,
    subscribeToSession,
    unsubscribeFromSession,
    onAttendanceUpdate,
    onSessionStatsUpdate,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
