import { useState, useEffect } from "react";
import apiFetch from "../services/apiFetch";

export const useFriendRequests = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPendingCount = async () => {
    try {
      const res = await apiFetch("GET", "/api/users/friendRequests/pending");
      if (res.ok) {
        const data = await res.json();
        setPendingCount(data.data.length);
      }
    } catch (error) {
      console.log("Error fetching pending count:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCount();
  }, []);

  return { pendingCount, isLoading, refreshCount: fetchPendingCount };
};
