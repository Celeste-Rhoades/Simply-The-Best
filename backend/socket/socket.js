const userSocketMap = {};

export const initializeSocket = io => {
  io.on("connection", socket => {
    console.log("A user connected", socket.id);
    // when user connects, they send user id
    socket.on("register", userId => {
      userSocketMap[userId] = socket.id;
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    // When a user disconnects, remove them from map
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      //find and remove user from map
      for (const [userId, socketId] of Object.entries(userSocketMap)) {
        if (socketId === socket.id) {
          delete userSocketMap[userId];
          console.log(`User ${userId} removed from socket map`);
          break;
        }
      }
    });
  });
};

// helper function to get users socket id
export const getUserSocketId = userId => {
  return userSocketMap[userId];
};
