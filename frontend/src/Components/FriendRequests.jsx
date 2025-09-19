import { React, useState, useEffect } from "react";
import apiFetch from "../services/apiFetch";

const FriendRequests = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState("");
  const [processing, setProcessing] = useState({});

  const fetchPendingRequests = async () => {
    setIsLoading(true);
    setErrors("");

    try {
      const res = await apiFetch("GET", `/api/users/friendRequests/pending`);
      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data.data);
      } else {
        // Handle server errors
        const errorData = await res.json().catch(() => ({}));
        setErrors(errorData.error || "Failed to load friend requests");
      }
    } catch (error) {
      setErrors("Failed to load friend requests");
      console.log("Error fetching pending requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptFriendRequest = async (userId) => {
    // Validate userId parameter
    if (!userId || typeof userId !== "string") {
      setErrors("Invalid user ID");
      return;
    }

    // Prevent duplicate processing
    if (processing[userId]) {
      return; // Already processing this request
    }

    setProcessing((prevProcessing) => ({
      ...prevProcessing,
      [userId]: true,
    }));

    setErrors("");

    try {
      const res = await apiFetch(
        "POST",
        `/api/users/friendRequest/accept/${userId}`,
      );

      if (res.ok) {
        setPendingRequests((prevRequests) =>
          prevRequests.filter((request) => request._id !== userId),
        );
      } else {
        // Handle server errors properly
        const errorData = await res.json().catch(() => ({}));
        setErrors(errorData.error || "Failed to accept friend request");
      }
    } catch (error) {
      setErrors("Failed to accept friend request");
      console.log("Error accepting friend request:", error);
    } finally {
      // Always clear processing state
      setProcessing((prevProcessing) => {
        const newProcessing = { ...prevProcessing };
        delete newProcessing[userId];
        return newProcessing;
      });
    }
  };
  useEffect(() => {
    let isMounted = true;

    const loadRequests = async () => {
      setIsLoading(true);
      setErrors("");

      try {
        const res = await apiFetch("GET", `/api/users/friendRequests/pending`);
        if (res.ok) {
          const data = await res.json();
          // Only update state if component is still mounted
          if (isMounted) {
            setPendingRequests(data.data);
          }
        } else {
          const errorData = await res.json().catch(() => ({}));
          if (isMounted) {
            setErrors(errorData.error || "Failed to load friend requests");
          }
        }
      } catch (error) {
        if (isMounted) {
          setErrors("Failed to load friend requests");
        }
        console.log("Error fetching pending requests:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadRequests();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  return <div>FriendRequest</div>;
};

export default FriendRequests;
