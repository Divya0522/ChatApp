import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
    try {
        const { text, receiverId, roomId, fileUrl } = req.body;
        const senderId = req.user._id;

        const newMessage = new Message({
            senderId,
            receiverId,
            roomId,
            text,
            fileUrl,
        });

        await newMessage.save();

        // SOCKET.IO LOGIC
        if (roomId) {
            // Room message
            io.to(roomId).emit("newMessage", newMessage);
        } else if (receiverId) {
            // Private message
            const receiverSocketId = getReceiverSocketId(receiverId);
            const senderSocketId = getReceiverSocketId(senderId);

            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newMessage", newMessage);
            }
            // Also emit to sender so their own UI updates immediately across all tabs
            if (senderSocketId) {
                io.to(senderSocketId).emit("newMessage", newMessage);
            }
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const { roomId } = req.query;
        const senderId = req.user._id;

        let query = {};
        if (roomId) {
            query = { roomId };
        } else {
            query = {
                $or: [
                    { senderId: senderId, receiverId: userToChatId },
                    { senderId: userToChatId, receiverId: senderId },
                ],
            };
        }

        const messages = await Message.find(query).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
