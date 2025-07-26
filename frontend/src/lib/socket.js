import { io } from 'socket.io-client';

const BACKEND_URL = 'https://api-collabcodec.onrender.com';

    const socket = io(BACKEND_URL);

export default socket;
