import { io } from 'socket.io-client';
import { getStoredToken, SERVER_BASE_URL } from './api';

let socketInstance = null;
let socketToken = '';

export function getSocket() {
  const token = getStoredToken();

  if (!token) {
    disconnectSocket();
    return null;
  }

  if (socketInstance && socketToken !== token) {
    socketInstance.disconnect();
    socketInstance = null;
  }

  if (!socketInstance) {
    socketInstance = io(SERVER_BASE_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
    socketToken = token;
  }

  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
  socketToken = '';
}
