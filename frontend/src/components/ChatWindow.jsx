import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import MessageInput from "./MessageInput";

const ChatWindow = ({ selectedChat }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null); // Fullscreen image view
    const { authUser } = useAuth();
    const { socket } = useSocket();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const isImageOnly = (msg) => {
        return !msg.text && msg.fileUrl && msg.fileUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i);
    };

    const isPdfOnly = (msg) => {
        return !msg.text && msg.fileUrl && msg.fileUrl.match(/\.(pdf)$/i);
    };

    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true);
            try {
                const id = selectedChat.type === "user" ? selectedChat.data._id : "room";
                const url = selectedChat.type === "room"
                    ? `http://localhost:5001/api/messages/room?roomId=${selectedChat.data._id}`
                    : `http://localhost:5001/api/messages/${id}`;

                const res = await axios.get(url, { withCredentials: true });
                setMessages(res.data);
            } catch (error) {
                console.error("Error fetching messages:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        if (selectedChat.type === "room") {
            socket?.emit("joinRoom", selectedChat.data._id);
        }

        return () => {
            if (selectedChat.type === "room") {
                socket?.emit("leaveRoom", selectedChat.data._id);
            }
        };
    }, [selectedChat, socket]);

    useEffect(() => {
        if (!socket) return;

        socket.on("newMessage", (message) => {
            // If it's a room message and we are in the room
            if (selectedChat.type === "room" && message.roomId === selectedChat.data._id) {
                setMessages((prev) => [...prev, message]);
            }
            // If it's a private message from the person we are chatting with
            else if (selectedChat.type === "user" && (message.senderId === selectedChat.data._id || message.senderId === authUser._id)) {
                setMessages((prev) => [...prev, message]);
            }
        });

        socket.on("typing", ({ userId, roomId }) => {
            if (selectedChat.type === "room" && roomId === selectedChat.data._id && userId !== authUser._id) {
                setIsTyping(true);
            }
        });

        socket.on("stopTyping", ({ userId, roomId }) => {
            if (selectedChat.type === "room" && roomId === selectedChat.data._id) {
                setIsTyping(false);
            }
        });

        return () => {
            socket.off("newMessage");
            socket.off("typing");
            socket.off("stopTyping");
        };
    }, [socket, selectedChat, authUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    return (
        <div className="chat-area">
            <div className="chat-header">
                <div className="header-info">
                    <h3>{selectedChat.type === "user" ? selectedChat.data.username : selectedChat.data.name}</h3>
                    {selectedChat.type === "user" && (
                        <span className="status">
                            {/* online users handles this via sidebar indicator, but could show text here too */}
                        </span>
                    )}
                </div>
            </div>

            <div className="messages-container">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message-bubble ${msg.senderId === authUser._id ? "sent" : "received"} ${isImageOnly(msg) ? "image-only" : ""} ${isPdfOnly(msg) ? "pdf-only" : ""}`}>
                        {selectedChat.type === "room" && msg.senderId !== authUser._id && (
                            <div className="sender-name">{/* We'd need to populate sender name or fetch it */}</div>
                        )}
                        <div className="message-content">
                            {msg.text && <p>{msg.text}</p>}
                            {msg.fileUrl && (
                                <div className="attachment">
                                    {msg.fileUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                                        <img
                                            src={`http://localhost:5001${msg.fileUrl}`}
                                            alt="attachment"
                                            onClick={() => setSelectedImage(`http://localhost:5001${msg.fileUrl}`)}
                                        />
                                    ) : msg.fileUrl.match(/\.pdf$/i) ? (
                                        <div className="pdf-attachment" onClick={() => setSelectedImage(`http://localhost:5001${msg.fileUrl}`)}>
                                            <div className="pdf-icon-wrapper">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                            </div>
                                            <div className="pdf-info">
                                                <span className="pdf-name">{msg.fileUrl.split("/").pop()}</span>
                                                <span className="pdf-size">Click to view</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="file-attachment">
                                            <span className="file-icon">📄</span>
                                            <a href={`http://localhost:5001${msg.fileUrl}`} target="_blank" rel="noreferrer">
                                                {msg.fileUrl.split("/").pop()}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                            <span className="timestamp">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                ))}
                {isTyping && <div className="typing-indicator">Someone is typing...</div>}
                <div ref={messagesEndRef} />
            </div>

            <MessageInput selectedChat={selectedChat} />

            {selectedImage && (
                <div className="image-viewer-modal" onClick={() => setSelectedImage(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        {selectedImage.match(/\.pdf$/i) ? (
                            <iframe src={selectedImage} title="PDF Viewer" className="pdf-viewer-frame" />
                        ) : (
                            <img src={selectedImage} alt="Full View" />
                        )}
                        <button className="close-modal" onClick={() => setSelectedImage(null)}>×</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatWindow;
