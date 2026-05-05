import { useState, useEffect, useCallback } from "react";
import apiFetch from "../services/apiFetch";

export const useFriendsRecommendations = () => {
  const [friendsRecs, setFriendsRecs] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState("");
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchFriendsRecs = useCallback(async (cursor = null) => {
    // Use different loading states for first load vs loading more
    cursor ? setIsFetchingMore(true) : setIsLoading(true);
    setError("");

    try {
      const url = cursor
        ? `/api/recommendations/friends?cursor=${cursor}`
        : `/api/recommendations/friends`;

      const res = await apiFetch("GET", url);
      if (res.ok) {
        const data = await res.json();

        setFriendsRecs((prev) => {
          // Merge new grouped data into existing data
          const merged = { ...prev };
          Object.entries(data.data).forEach(([userId, userData]) => {
            if (merged[userId]) {
              // User already exists — append their new recommendations
              merged[userId] = {
                ...merged[userId],
                recommendations: [
                  ...merged[userId].recommendations,
                  ...userData.recommendations,
                ],
              };
            } else {
              // New user — add them
              merged[userId] = userData;
            }
          });
          return merged;
        });

        setNextCursor(data.nextCursor);
        setHasMore(data.nextCursor !== null);
      } else {
        setError("Failed to fetch friends' recommendations");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      cursor ? setIsFetchingMore(false) : setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    // Prevent duplicate calls if already loading or nothing left
    if (isFetchingMore || !hasMore) return;
    fetchFriendsRecs(nextCursor);
  }, [isFetchingMore, hasMore, nextCursor, fetchFriendsRecs]);

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
    } catch {
      return { success: false, error: "Network error" };
    }
  }, []);

  useEffect(() => {
    fetchFriendsRecs();
  }, [fetchFriendsRecs]);

  return {
    friendsRecs,
    isLoading,
    isFetchingMore,
    hasMore,
    error,
    copyRecommendation,
    loadMore,
    refreshRecs: fetchFriendsRecs,
  };
};
