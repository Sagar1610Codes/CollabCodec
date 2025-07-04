import { Server } from 'socket.io';
import * as Y from 'yjs';

const docs = new Map();

const setupSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [process.env.FRONTEND_URL, process.env.IP_FRONTEND_URL],  // local host and network ip both compatible
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    // console.log('⚡ Socket connected:', socket.id);

    socket.on('join-room', (roomId) => {
      console.log(`✅ ${socket.id} joined room: ${roomId}`);
      socket.join(roomId);


      // Create Y.Doc if it doesn't exist
      if (!docs.has(roomId)) {
        docs.set(roomId, new Y.Doc());
      }

      const ydoc = docs.get(roomId);

      // Send current state to the new user
      const state = Y.encodeStateAsUpdate(ydoc);
      socket.emit('y-update', state);

      // Listen for and broadcast new updates
      socket.on('y-update', (update) => {
        Y.applyUpdate(ydoc, update);
        socket.to(roomId).emit('y-update', update);
        console.log(update)
      });


      socket.on('disconnect', () => {
        console.log(`❌ ${socket.id} left room ${roomId}`);
      });
    });
  });

  return io; // optionally return io for chaining/middleware/testing
};

export { setupSocketIO };
