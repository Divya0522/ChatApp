import { useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

const MessageInput = ({ selectedChat }) => {
    const [text, setText] = useState("");
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const { authUser } = useAuth();
    const { socket } = useSocket();
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);

        // Generate preview for images
        if (selectedFile.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setPreview(null);
        }
    };

    const removeFile = () => {
        setFile(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleTyping = () => {
        // ... (same logic as before)
        if (selectedChat.type === "room") {
            socket?.emit("typing", { roomId: selectedChat.data._id, userId: authUser._id });

            clearTimeout(window.typingTimeout);
            window.typingTimeout = setTimeout(() => {
                socket?.emit("stopTyping", { roomId: selectedChat.data._id, userId: authUser._id });
            }, 2000);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!text && !file) return;

        setIsUploading(true);
        let fileUrl = "";

        if (file) {
            const formData = new FormData();
            formData.append("file", file);
            try {
                const res = await axios.post("http://localhost:5001/api/upload/upload", formData, {
                    withCredentials: true,
                    headers: { "Content-Type": "multipart/form-data" },
                });
                fileUrl = res.data.fileUrl;
            } catch (error) {
                console.error("File upload failed:", error);
                alert("Could not upload file. Please try again.");
                setIsUploading(false);
                return;
            }
        }

        try {
            const messageData = {
                text,
                fileUrl,
                [selectedChat.type === "user" ? "receiverId" : "roomId"]: selectedChat.data._id,
            };

            await axios.post("http://localhost:5001/api/messages/send", messageData, {
                withCredentials: true,
            });

            setText("");
            removeFile();

            if (selectedChat.type === "room") {
                socket?.emit("stopTyping", { roomId: selectedChat.data._id, userId: authUser._id });
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="message-input-container">
            {preview && (
                <div className="preview-container">
                    <img src={preview} alt="Preview" />
                    <button type="button" className="remove-preview" onClick={removeFile}>×</button>
                </div>
            )}
            {file && !preview && (
                <div className="file-name-preview">
                    <span>📎 {file.name}</span>
                    <button type="button" className="remove-preview" onClick={removeFile}>×</button>
                </div>
            )}
            <form onSubmit={handleSend} className="input-form">
                <button
                    type="button"
                    className="attach-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                >
                    📎
                </button>
                <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
                <input
                    type="text"
                    placeholder={isUploading ? "Uploading..." : "Type a message..."}
                    value={text}
                    disabled={isUploading}
                    onChange={(e) => {
                        setText(e.target.value);
                        handleTyping();
                    }}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend(e)}
                />
                <button type="submit" className="send-btn" disabled={isUploading || (!text && !file)}>
                    {isUploading ? "..." : "Send"}
                </button>
            </form>
        </div>
    );
};

export default MessageInput;
