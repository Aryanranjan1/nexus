// server.ts - Next.js Server with Socket.IO
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const startServer = async () => {
  try {
    await app.prepare();
    
    const server = createServer((req, res) => {
      handle(req, res);
    });

    // Setup Socket.IO
    const io = new SocketServer(server, {
      path: '/api/socketio',
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Setup basic Socket.IO event handlers
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    server.listen(port, () => {
      console.log(`> Ready on http://localhost:${port}`);
      console.log(`> Socket.IO server running at ws://localhost:${port}/api/socketio`);
    });

  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
};

// Start the server
startServer();
