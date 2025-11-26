import { createContext, useContext, useState, useEffect } from "react";
import socket from "../services/socket";
import apiFetch from "../services/apiFetch";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  // Friend Requests State
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friendRequestCount, setFriendRequestCount] = useState(0);

  // Recommendations State
  const [pendingRecommendationCount, setPendingRecommendationCount] =
    useState(0);

  // Accepted Notifications State
  const [acceptedNotifications, setAcceptedNotifications] = useState([]);

  // Initial fetch of pending friend requests
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await apiFetch("GET", "/api/users/friendRequests/pending");
        if (res.ok) {
          const data = await res.json();
          setPendingRequests(data.data || []);
          setFriendRequestCount(data.data?.length || 0);
        }
      } catch (error) {
        console.error("Error fetching initial friend requests:", error);
      }
    };

    fetchInitialData();
  }, []);

  // Listen for socket events
  useEffect(() => {
    console.log("🔔 NotificationContext socket listeners registered");
    // New friend request received
    socket.on("newFriendRequest", (data) => {
      console.log("New friend request from:", data.senderUsername);

      // Add to pending requests list
      setPendingRequests((prev) => [
        ...prev,
        { _id: data.senderId, username: data.senderUsername },
      ]);

      // Increment count
      setFriendRequestCount((prev) => prev + 1);
    });

    // Friend request accepted
    socket.on("friendRequestAccepted", (data) => {
      console.log("Friend request accepted by:", data.acceptorUsername);

      // Add to accepted notifications
      setAcceptedNotifications((prev) =>
        [
          {
            id: data.notification._id,
            type: "friend_request_accepted",
            username: data.acceptorUsername,
            userId: data.acceptorId,
            read: false,
            createdAt: new Date(),
          },
          ...prev,
        ].slice(0, 5),
      );
    });

    // New recommendation received
    socket.on("newRecommendation", (data) => {
      console.log("New recommendation from:", data.senderUsername);
      setPendingRecommendationCount((prev) => prev + 1);
    });

    // Friend request declined (silent removal)
    socket.on("friendRequestDeclined", (data) => {
      console.log("Friend request was declined");
      // Silent - no action needed on sender's side
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off("newFriendRequest");
      socket.off("friendRequestAccepted");
      socket.off("newRecommendation");
      socket.off("friendRequestDeclined");
    };
  }, []);

  // Helper functions for accepting/declining
  const removeFriendRequest = (userId) => {
    setPendingRequests((prev) => prev.filter((r) => r._id !== userId));
    setFriendRequestCount((prev) => Math.max(0, prev - 1));
  };

  const value = {
    // Friend Requests
    pendingRequests,
    friendRequestCount,
    removeFriendRequest,

    // Recommendations
    pendingRecommendationCount,
    setPendingRecommendationCount,

    // Accepted Notifications
    acceptedNotifications,
    setAcceptedNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
