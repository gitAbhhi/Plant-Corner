import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { chatAPI } from '../services/api';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080';

export function useChat(plantId) {
  const [messages, setMessages] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  // 1. Get or create chat room + load history
  useEffect(() => {
    if (!plantId) return;
    setLoading(true);
    chatAPI.getOrCreateRoom(plantId)
      .then(res => {
        const id = res.data.id;
        setRoomId(id);
        return chatAPI.getRoomMessages(id);
      })
      .then(res => setMessages(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [plantId]);

  // 2. Connect Socket.io when roomId is ready
  useEffect(() => {
    if (!roomId) return;
    const token = localStorage.getItem('gp_token');

    const socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionDelay: 3000,
    });

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_room', roomId);
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('receive_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });

    socketRef.current = socket;

    return () => {
      socket.emit('leave_room', roomId);
      socket.disconnect();
    };
  }, [roomId]);

  const sendMessage = useCallback((content) => {
    if (!socketRef.current?.connected || !roomId) return;
    socketRef.current.emit('send_message', { chatRoomId: roomId, content });
  }, [roomId]);

  return { messages, connected, loading, sendMessage, roomId };
}
