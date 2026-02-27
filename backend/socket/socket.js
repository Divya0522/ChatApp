import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST"],
    },
});

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
    console.log("a user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId !== "undefined") userSocketMap[userId] = socket.id;

    // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        console.log(`User ${userId} joined room ${roomId}`);
    });

    socket.on("leaveRoom", (roomId) => {
        socket.leave(roomId);
        console.log(`User ${userId} left room ${roomId}`);
    });

    socket.on("typing", ({ roomId, userId }) => {
        if (roomId) {
            socket.to(roomId).emit("typing", { userId, roomId });
        } else {
            // For private chats, we could handle this if we pass receiverId
        }
    });

    socket.on("stopTyping", ({ roomId, userId }) => {
        if (roomId) {
            socket.to(roomId).emit("stopTyping", { userId, roomId });
        }
    });

    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { app, io, server };
