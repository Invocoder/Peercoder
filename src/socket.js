
import { io } from 'socket.io-client';
export const initSocket = async () => {
  
    const options = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        transports: ['websocket'],
    };
     return io("http://13.49.102.45:5000", options);
};
// yarn upgrade codemirror@5.65.12
