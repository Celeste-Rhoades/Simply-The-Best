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

  // Initial fetch of pending friend requests AND pending recommendations
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch pending friend requests
        const friendReqRes = await apiFetch(
          "GET",
          "/api/users/friendRequests/pending",
        );
        if (friendReqRes.ok) {
          const friendReqData = await friendReqRes.json();
          setPendingRequests(friendReqData.data || []);
          setFriendRequestCount(friendReqData.data?.length || 0);
        }

        // Fetch pending recommendations
        const pendingRecRes = await apiFetch(
          "GET",
          "/api/recommendations/pending",
        );
        if (pendingRecRes.ok) {
          const pendingRecData = await pendingRecRes.json();
          setPendingRecommendationCount(pendingRecData.data?.length || 0);
        }
      } catch (error) {
        console.error("Error fetching initial notification data:", error);
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

      // Only add to accepted notifications if notification object exists
      // (only exists when YOU are the requester, not the acceptor)
      if (data.notification) {
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
      }
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

  // Helper: Clear badge counts when bell opens
  const clearBadgeCounts = () => {
    // Badge shows 0, but items stay until acted upon
  };

  // Helper: Mark accepted notifications as read
  const markAcceptedAsRead = () => {
    setAcceptedNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true })),
    );
  };

  // Helper: Delete single accepted notification
  const deleteAcceptedNotification = async (notificationId) => {
    try {
      const res = await apiFetch(
        "DELETE",
        `/api/notifications/${notificationId}`,
      );
      if (res.ok) {
        setAcceptedNotifications((prev) =>
          prev.filter((notif) => notif.id !== notificationId),
        );
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Helper: Clear all accepted notifications
  const clearAllAcceptedNotifications = async () => {
    try {
      const res = await apiFetch("DELETE", "/api/notifications");
      if (res.ok) {
        setAcceptedNotifications([]);
      }
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
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
    markAcceptedAsRead,
    deleteAcceptedNotification,
    clearAllAcceptedNotifications,

    // Badge
    clearBadgeCounts,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
