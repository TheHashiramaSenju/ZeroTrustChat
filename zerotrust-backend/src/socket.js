import { Server } from 'socket.io';
import authenticateSocket from './middleware/authenticateSocket.js';

export function initializeSocket(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    // Attach the authentication middleware to all incoming connections
    io.use(authenticateSocket);

    // Main connection handler
    io.on('connection', (socket) => {
        console.log(`[Socket.IO] User connected: ${socket.user.email} (ID: ${socket.user.id})`);

        // Join a room specific to this user, so we can send them direct messages
        socket.join(socket.user.id);

        // --- Define Event Handlers Here ---

        // Example: Handle an incoming chat message
        socket.on('sendMessage', (data) => {
            // `data` should contain { to: 'recipientUserId', content: 'Hello!' }
            console.log(`Message from ${socket.user.id} to ${data.to}: ${data.content}`);
            
            // TODO: Add validation, save to DB

            // Emit the message directly to the recipient's private room
            io.to(data.to).emit('receiveMessage', {
                from: socket.user.id,
                content: data.content,
                timestamp: new Date().toISOString(),
            });
        });


        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`[Socket.IO] User disconnected: ${socket.user.email}`);
        });
    });

    return io;
}
