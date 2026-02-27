# ChatApp: Connect, Share, and Chat

Welcome to chatApp which enables users for authentication and then able to support seamless real time chatting enabling upload of images and pdfs

## Why ChatApp?

Real time view updates along with count of the unread messages along with active status of users with green dot visility

## Getting Started

Setting up your own instance of ChatApp is straightforward. Follow these steps to get up and running.

### Prerequisites

*   **Node.js** (v18 or higher recommended)
*   **MongoDB** (Local or Cloud instance)

### 1. Configure the Backend

Navigate to the `backend` folder and create a `.env` file:

```env
# MongoDB Connection (use 127.0.0.1 for local setups)
MONGO_URI=mongodb://127.0.0.1:27017/ChatApp

# Server Port
PORT=5001

# Security Secret (Change this!)
JWT_SECRET=your_random_secret_here
```

### 2. Launch the Application

In two separate terminals, run the following:

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Your app will be live at `http://localhost:5173`!

## Built With Love Using

*   **Frontend**: React, Vite, Axios, Socket.io-client
*   **Backend**: Express, Node.js, Socket.io
*   **Database**: MongoDB & Mongoose
*   **Styling**: Custom CSS for a unique, premium feel
