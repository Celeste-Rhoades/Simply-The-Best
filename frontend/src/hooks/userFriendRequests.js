import { useState, useEffect } from "react";
import apiFetch from "../services/apiFetch";

export const useFriendRequests = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  const fetchPendingRequests = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch("GET", "/api/users/friendRequests/pending");
      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data.data);
        setPendingCount(data.data.length);
      }
    } catch (error) {
      console.log("Error fetching pending requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptRequest = async (userId) => {
    if (processing[userId]) return;

    setProcessing((prev) => ({ ...prev, [userId]: "accepting" }));

    try {
      const res = await apiFetch(
        "POST",
        `/api/users/friendRequest/accept/${userId}`,
      );
      if (res.ok) {
        // Remove from pending requests
        setPendingRequests((prev) =>
          prev.filter((request) => request._id !== userId),
        );
        setPendingCount((prev) => prev - 1);
      }
    } catch (error) {
      console.log("Error accepting friend request:", error);
    } finally {
      setProcessing((prev) => {
        const newProcessing = { ...prev };
        delete newProcessing[userId];
        return newProcessing;
      });
    }
  };

  const declineRequest = async (userId) => {
    if (processing[userId]) return;

    setProcessing((prev) => ({ ...prev, [userId]: "declining" }));

    try {
      const res = await apiFetch(
        "POST",
        `/api/users/friendRequest/decline/${userId}`,
      );
      if (res.ok) {
        // Remove from pending requests
        setPendingRequests((prev) =>
          prev.filter((request) => request._id !== userId),
        );
        setPendingCount((prev) => prev - 1);
      }
    } catch (error) {
      console.log("Error declining friend request:", error);
    } finally {
      setProcessing((prev) => {
        const newProcessing = { ...prev };
        delete newProcessing[userId];
        return newProcessing;
      });
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  return {
    pendingRequests,
    pendingCount,
    isLoading,
    acceptRequest,
    declineRequest,
    processing,
    refreshCount: fetchPendingRequests,
  };
};
