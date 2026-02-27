import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

const Dashboard = () => {
    const [selectedChat, setSelectedChat] = useState(null); // { type: 'user' | 'room', data: object }

    return (
        <div className="dashboard">
            <Sidebar setSelectedChat={setSelectedChat} selectedChat={selectedChat} />
            {selectedChat ? (
                <ChatWindow selectedChat={selectedChat} />
            ) : (
                <div className="chat-area empty">
                    <div className="no-chat">
                        <h3>Select a conversation to start chatting</h3>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
