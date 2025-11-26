import { io } from "socket.io-client";

// Get the backend URL from environment variable
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5288";

// Create socket connection
const socket = io(BACKEND_URL, {
  autoConnect: false, // connects when user logs in
  withCredentials: true,
});

// Helper to connect and register user
export const connectSocket = (userId) => {
  if (!socket.connected) {
    socket.connect();
  }
  socket.emit("register", userId);
  console.log("Socket connected and registered for user:", userId);
};

// Helper to disconnect
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log("Socket disconnected");
  }
};

export default socket;
