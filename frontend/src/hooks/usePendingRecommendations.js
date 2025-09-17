import { useState, useEffect, useCallback } from "react";
import apiFetch from "../services/apiFetch";

export const usePendingRecommendations = () => {
  const [pendingRecs, setPendingRecs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingActions, setProcessingActions] = useState({});

  const fetchPendingRecs = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await apiFetch("GET", "/api/recommendations/pending");
      if (res.ok) {
        const data = await res.json();
        setPendingRecs(data.data);
      } else {
        setError("Failed to fetch pending recommendations");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approveRecommendation = useCallback(async (id, updatedData) => {
    setProcessingActions((prev) => ({ ...prev, [id]: "approving" }));

    try {
      const res = await apiFetch(
        "POST",
        `/api/recommendations/approve/${id}`,
        updatedData,
      );
      if (res.ok) {
        // Optimistically remove from pending list
        setPendingRecs((prev) => prev.filter((rec) => rec._id !== id));
        return { success: true };
      } else {
        const errorData = await res.json();
        return { success: false, error: errorData.message };
      }
    } catch (error) {
      return { success: false, error: "Network error" };
    } finally {
      setProcessingActions((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  }, []);

  const rejectRecommendation = useCallback(async (id) => {
    setProcessingActions((prev) => ({ ...prev, [id]: "rejecting" }));

    try {
      const res = await apiFetch("POST", `/api/recommendations/reject/${id}`);
      if (res.ok) {
        // Optimistically remove from pending list
        setPendingRecs((prev) => prev.filter((rec) => rec._id !== id));
        return { success: true };
      } else {
        const errorData = await res.json();
        return { success: false, error: errorData.message };
      }
    } catch (error) {
      return { success: false, error: "Network error" };
    } finally {
      setProcessingActions((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  }, []);

  useEffect(() => {
    fetchPendingRecs();
  }, [fetchPendingRecs]);

  return {
    pendingRecs,
    isLoading,
    error,
    processingActions,
    approveRecommendation,
    rejectRecommendation,
    refreshRecs: fetchPendingRecs,
  };
};
