import { io } from 'socket.io-client';

export const initSocket = async () => {
  // console.log(process.env.REACT_APP_BACKEND_URL);
  const options = {
    'force new connection': true,
    reconnectionAttempt: 'Infinity',
    timeout: 10000,
    transports: ['websocket'],
  };
  return io('https://code-sync-u1um.onrender.com', options);
  // return io(process.env.REACT_APP_BACKEND_URL, options);
};
