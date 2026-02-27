import express from "express";
import upload from "../middleware/upload.middleware.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/upload", protectRoute, upload.single("file"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        const fileUrl = `/uploads/${req.file.filename}`;
        res.status(200).json({ fileUrl });
    } catch (error) {
        console.error("Error in upload route: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
