import { useState, useEffect } from "react";
import apiFetch from "../services/apiFetch";

export const useFriendRequests = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  // Fetch pending requests on mount
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await apiFetch("GET", "/api/users/friendRequests/pending");

        if (res.ok) {
          const data = await res.json();
          setPendingRequests(data.data || []);
          setPendingCount(data.data?.length || 0);
        }
      } catch (error) {
        console.error("Error fetching friend requests:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Accept friend request - RETURNS TRUE ON SUCCESS
  const acceptRequest = async (userId) => {
    // Set processing state
    setProcessing((prev) => ({ ...prev, [userId]: "accepting" }));

    try {
      const res = await apiFetch(
        "POST",
        `/api/users/friendRequest/accept/${userId}`,
      );

      if (res.ok) {
        // Update local state - remove from pending list
        setPendingRequests((prev) => prev.filter((r) => r._id !== userId));
        setPendingCount((prev) => prev - 1);

        // Clear processing state
        setProcessing((prev) => {
          const newState = { ...prev };
          delete newState[userId];
          return newState;
        });

        // IMPORTANT: Return true for success
        return true;
      }

      // Clear processing state on failure
      setProcessing((prev) => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });

      // IMPORTANT: Return false for failure
      return false;
    } catch (error) {
      console.error("Error accepting request:", error);

      // Clear processing state on error
      setProcessing((prev) => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });

      // IMPORTANT: Return false for error
      return false;
    }
  };

  // Decline friend request
  const declineRequest = async (userId) => {
    // Set processing state
    setProcessing((prev) => ({ ...prev, [userId]: "declining" }));

    try {
      const res = await apiFetch(
        "POST",
        `/api/users/friendRequest/decline/${userId}`,
      );

      if (res.ok) {
        // Update local state - remove from pending list
        setPendingRequests((prev) => prev.filter((r) => r._id !== userId));
        setPendingCount((prev) => prev - 1);
      }

      // Clear processing state
      setProcessing((prev) => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    } catch (error) {
      console.error("Error declining request:", error);

      // Clear processing state on error
      setProcessing((prev) => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    }
  };

  return {
    pendingRequests,
    pendingCount,
    isLoading,
    processing,
    acceptRequest, // Now returns true/false
    declineRequest,
  };
};
