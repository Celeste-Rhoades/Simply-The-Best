import { useState, useEffect, useCallback } from "react";
import apiFetch from "../services/apiFetch";

export const useFriendsRecommendations = () => {
  const [friendsRecs, setFriendsRecs] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFriendsRecs = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await apiFetch("GET", `/api/recommendations/friends`);
      if (res.ok) {
        const data = await res.json();
        setFriendsRecs(data.data);
      } else {
        setError("Failed to fetch friends' recommendations");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const copyRecommendation = useCallback(async (originalId, updatedData) => {
    try {
      const res = await apiFetch(
        "POST",
        `/api/recommendations/copy/${originalId}`,
        updatedData,
      );
      if (res.ok) {
        return { success: true };
      } else {
        const errorData = await res.json();
        return { success: false, error: errorData.message };
      }
    } catch (err) {
      return { success: false, error: "Network error" };
    }
  }, []);

  useEffect(() => {
    fetchFriendsRecs();
  }, [fetchFriendsRecs]);

  return {
    friendsRecs,
    isLoading,
    error,
    copyRecommendation,
    refreshRecs: fetchFriendsRecs,
  };
};
