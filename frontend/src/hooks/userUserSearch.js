import { useState, useEffect, useCallback } from "react";
import apiFetch from "../services/apiFetch";

export const useUserSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [requestStatus, setRequestStatus] = useState({});

  const handleSearch = useCallback(async () => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      setSearchError("");
      return;
    }

    setIsLoading(true);
    setSearchError("");

    try {
      const res = await apiFetch(
        "GET",
        `/api/users/search?search=${searchTerm}`,
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.data); // This should now include friendship status
      } else {
        setSearchError("Failed to search users");
      }
    } catch (err) {
      setSearchError("Network error. Please try again.");
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
        setSearchError("");
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, handleSearch]);

  const sendFriendRequest = useCallback(async (userId) => {
    try {
      setRequestStatus((prev) => ({ ...prev, [userId]: "loading" }));

      const res = await apiFetch(
        "POST",
        `/api/users/friendRequest/send/${userId}`,
      );

      if (res.ok) {
        setRequestStatus((prev) => ({ ...prev, [userId]: "sent" }));
      } else {
        setRequestStatus((prev) => ({ ...prev, [userId]: "error" }));
      }
    } catch (err) {
      setRequestStatus((prev) => ({ ...prev, [userId]: "error" }));
      console.log(err);
    }
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isLoading,
    searchError,
    requestStatus,
    sendFriendRequest,
  };
};
