import Room from "../models/room.model.js";
import User from "../models/user.model.js";

export const createRoom = async (req, res) => {
    try {
        const { name, members } = req.body;
        const createdBy = req.user._id;

        const existingRoom = await Room.findOne({ name });
        if (existingRoom) {
            return res.status(400).json({ error: "Room name already exists" });
        }

        const newRoom = new Room({
            name,
            members: [...members, createdBy],
            createdBy,
        });

        await newRoom.save();
        res.status(201).json(newRoom);
    } catch (error) {
        console.log("Error in createRoom controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getRooms = async (req, res) => {
    try {
        const userId = req.user._id;
        const rooms = await Room.find({ members: userId });
        res.status(200).json(rooms);
    } catch (error) {
        console.log("Error in getRooms controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getUsers = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error in getUsers: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
