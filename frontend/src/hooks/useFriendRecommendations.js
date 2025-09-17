import { useState, useEffect, useCallback } from "react";
import apiFetch from "../services/apiFetch";

export const useFriendRecommendations = () => {
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchFriends = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await apiFetch("GET", "/api/users/friends");
      if (res.ok) {
        const data = await res.json();
        setFriends(data.data);
      } else {
        setError("Failed to fetch friends list");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const recommendToFriend = useCallback(
    async (friendId, recommendationData) => {
      try {
        const res = await apiFetch(
          "POST",
          `/api/recommendations/recommend/${friendId}`,
          recommendationData,
        );
        if (res.ok) {
          return { success: true };
        } else {
          const errorData = await res.json();
          return { success: false, error: errorData.message };
        }
      } catch (error) {
        return { success: false, error: "Network error" };
      }
    },
    [],
  );

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  return {
    friends,
    isLoading,
    error,
    recommendToFriend,
    refreshFriends: fetchFriends,
  };
};
