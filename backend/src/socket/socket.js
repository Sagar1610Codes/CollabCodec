import { Server } from 'socket.io';
import * as Y from 'yjs';

const docs = new Map();

const setupSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,  // local host and network ip both compatible
      methods: ['GET', 'POST'],
    },
  });

  const getUsersInProject = (projectId) => {
    const users = [];

    for (const [_, socket] of io.of('/').sockets) {
      const userId = socket.data.userId
      const username = socket.data.username

      if (userId && socket.data.projectId === projectId) {
        users.push({
          username: username,
          onFile: socket.data.onFile || null,
        });
      }
    }

    return users;
  };

  io.on('connection', (socket) => {
    // console.log('⚡ Socket connected:', socket.id);

    socket.on('join-project-room', (projectRoomId) => {
      console.log(`✅ ${socket.id} joined project room: ${projectRoomId}`);

      const projectId = projectRoomId.replace('room-', '');
      console.log("socket.handshake.auth:", socket.handshake.auth); // Debug log
      socket.data.projectId = projectId;
      socket.data.username = socket.handshake.auth.username
      // console.log("username in socket:",socket.data.username)
      socket.data.userId = socket.handshake.auth.userId

      socket.join(projectRoomId);

      // Optional: broadcast presence
      socket.to(projectRoomId).emit('project-user-joined', { username: socket.data.username });
      const users = getUsersInProject(projectId);
      io.to(projectRoomId).emit('project-user-map', users);

    });
    
    
    socket.on('leave-project-room', (projectId) => {
      const projectRoomId = `room-${projectId}`

      
      console.log(`❌ ${socket.id} disconnected from project: ${projectRoomId}`);
      socket.to(projectRoomId).emit('project-user-left', { username: socket.data.username });
      const users = getUsersInProject(projectId);
      io.to(projectRoomId).emit('project-user-map', users);
      
      socket.leave(projectRoomId);

      setTimeout(() => {
        const projectRoom = io.sockets.adapter.rooms.get(projectRoomId);
        const projectRoomSize = projectRoom?.size || 0;

        if (projectRoomSize === 0) {
          for (const key of docs.keys()) {
            if (key.startsWith(`room-${projectId}-`)) {
              docs.delete(key);
              console.log(`🧹 Deleted Y.Doc: ${key}`);
            }
          }
        } else {
          console.log(`♻️ Project room ${projectRoomId} still has ${projectRoomSize} user(s) — skipping cleanup`);
        }
      }, 10 * 1000)
    });


    // File Room Logic
    socket.on('join-file-room', (fileRoomId, projectId, filePath) => {

      console.log(`📝 ${socket.id} joined file room: ${fileRoomId}`);
      
      socket.join(fileRoomId);
      socket.data.onFile = filePath;

      const projectRoomId = `room-${projectId}`

      const users = getUsersInProject(projectId)
      io.to(projectRoomId).emit('project-user-map', users)
      console.log("users :",users)

      // Create Y.Doc for this file if it doesn't exist
      if (!docs.has(fileRoomId)) {
        docs.set(fileRoomId, new Y.Doc());
      }

      const ydoc = docs.get(fileRoomId);

      // Send current Yjs state to the newly joined client
      const encodedState = Y.encodeStateAsUpdate(ydoc);
      socket.emit('y-update', encodedState);

      // Apply incoming Yjs update
      const handleUpdate = (update) => {
        try {
          Y.applyUpdate(ydoc, update);
          socket.to(fileRoomId).emit('y-update', update);
        } catch (err) {
          console.error(`❌ Error applying Yjs update:`, err);
        }
      };

      socket.on('y-update', handleUpdate);

    });
    
    socket.on('leave-file-room', (projectId, fileRoomId) => {
      const projectRoomId = `room-${projectId}`

      socket.leave(fileRoomId);

      const users = getUsersInProject(projectId);
      io.to(projectRoomId).emit('project-user-map', users);
      
      console.log(`📤 ${socket.id} left file room: ${fileRoomId}`);
    });



    // Terminal logic

  });

  return io; // optionally return io for chaining/middleware/testing
};

export { setupSocketIO };
