import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

const Sidebar = ({ setSelectedChat, selectedChat }) => {
    const [users, setUsers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCounts, setUnreadCounts] = useState({}); // { id: count }
    const { authUser, setAuthUser } = useAuth();
    const { onlineUsers, socket } = useSocket();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, roomsRes] = await Promise.all([
                    axios.get("http://localhost:5001/api/rooms/users", { withCredentials: true }),
                    axios.get("http://localhost:5001/api/rooms", { withCredentials: true }),
                ]);
                setUsers(usersRes.data);
                setRooms(roomsRes.data);
            } catch (error) {
                console.error("Error fetching sidebar data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on("newMessage", (message) => {
            const id = message.roomId || message.senderId;
            if (selectedChat?.data?._id !== id) {
                setUnreadCounts((prev) => ({
                    ...prev,
                    [id]: (prev[id] || 0) + 1,
                }));
            }
        });

        return () => socket.off("newMessage");
    }, [socket, selectedChat]);

    const handleSelectChat = (type, data) => {
        setSelectedChat({ type, data });
        setUnreadCounts((prev) => ({
            ...prev,
            [data._id]: 0,
        }));
    };

    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:5001/api/auth/logout", {}, { withCredentials: true });
            setAuthUser(null);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="user-profile">
                    <img src={authUser.avatar} alt="avatar" />
                    <span>{authUser.username}</span>
                </div>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>

            <div className="sidebar-content">
                <div className="section">
                    <h4>Rooms</h4>
                    {rooms.map((room) => (
                        <div
                            key={room._id}
                            className={`sidebar-item ${selectedChat?.data?._id === room._id ? "active" : ""}`}
                            onClick={() => handleSelectChat("room", room)}
                        >
                            <div className="item-icon">#</div>
                            <div className="item-info">
                                <span>{room.name}</span>
                                <p className="last-message">Click to join room</p>
                            </div>
                            {unreadCounts[room._id] > 0 && <div className="unread-badge">{unreadCounts[room._id]}</div>}
                        </div>
                    ))}
                </div>

                <div className="section">
                    <h4>Users</h4>
                    {users.map((user) => (
                        <div
                            key={user._id}
                            className={`sidebar-item ${selectedChat?.data?._id === user._id ? "active" : ""}`}
                            onClick={() => handleSelectChat("user", user)}
                        >
                            <div className="avatar-wrapper">
                                <img src={user.avatar} alt="avatar" />
                                {onlineUsers.includes(user._id) && <div className="online-indicator"></div>}
                            </div>
                            <div className="item-info">
                                <span>{user.username}</span>
                                <p className="last-message">Start chatting...</p>
                            </div>
                            {unreadCounts[user._id] > 0 && <div className="unread-badge">{unreadCounts[user._id]}</div>}
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
