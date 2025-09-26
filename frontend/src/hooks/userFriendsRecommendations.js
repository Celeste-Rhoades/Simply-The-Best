import { useState, useEffect, useCallback } from "react";
import apiFetch from "../services/apiFetch";

export const useFriendsRecommendations = () => {
  const [friendsRecs, setFriendsRecs] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchFriendsRecs = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setIsLoading(true);
    setError("");

    try {
      const res = await apiFetch(
        "GET",
        `/api/recommendations/friends?page=${pageNum}&limit=10`,
      );
      if (res.ok) {
        const data = await res.json();
        setFriendsRecs((prev) =>
          append ? { ...prev, ...data.data } : data.data,
        );
        setHasMore(data.hasMore);
      } else {
        setError("Failed to fetch friends' recommendations");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      if (pageNum === 1) setIsLoading(false);
    }
  }, []);

  const loadMoreFriends = useCallback(() => {
    if (hasMore && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFriendsRecs(nextPage, true);
    }
  }, [hasMore, isLoading, page, fetchFriendsRecs]);

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
    fetchFriendsRecs(1, false);
  }, [fetchFriendsRecs]);

  return {
    friendsRecs,
    isLoading,
    error,
    hasMore,
    loadMoreFriends,
    copyRecommendation,
    refreshRecs: () => fetchFriendsRecs(1, false),
  };
};
