import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiFetch from "../services/apiFetch";
import routes from "../routes";

const FriendRequests = () => {
  // State management - grouped logically
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState("");
  const [processing, setProcessing] = useState({});

  const navigate = useNavigate();

  // Helper function to clear processing state (DRY principle)
  const clearProcessingState = (userId) => {
    setProcessing((prevProcessing) => {
      const newProcessing = { ...prevProcessing };
      delete newProcessing[userId];
      return newProcessing;
    });
  };

  // Helper function to handle server errors consistently
  const handleServerError = async (response, fallbackMessage) => {
    try {
      const errorData = await response.json();
      return errorData.error || fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  };

  // Function to fetch pending friend requests
  const fetchPendingRequests = async () => {
    setIsLoading(true);
    setErrors("");

    try {
      const res = await apiFetch("GET", `/api/users/friendRequests/pending`);

      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data.data);
      } else {
        const errorMessage = await handleServerError(
          res,
          "Failed to load friend requests",
        );
        setErrors(errorMessage);
      }
    } catch (error) {
      setErrors("Failed to load friend requests");
      console.log("Error fetching pending requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to accept a friend request
  const acceptFriendRequest = async (userId) => {
    if (!userId || typeof userId !== "string") {
      setErrors("Invalid user ID");
      return;
    }

    if (processing[userId]) {
      return;
    }

    setProcessing((prev) => ({ ...prev, [userId]: true }));
    setErrors("");

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

        // Navigate with state to trigger refetch, use replace to avoid back button issues
        navigate(routes.recommendations, {
          state: { refetchFriends: Date.now() },
          replace: true,
        });
      } else {
        const errorMessage = await handleServerError(
          res,
          "Failed to accept friend request",
        );
        setErrors(errorMessage);
      }
    } catch (error) {
      setErrors("Failed to accept friend request");
      console.log("Error accepting friend request:", error);
    } finally {
      // Always clear processing state
      clearProcessingState(userId);
    }
  };

  // Function to decline a friend request
  const declineFriendRequest = async (userId) => {
    // Input validation
    if (!userId || typeof userId !== "string") {
      setErrors("Invalid user ID");
      return;
    }

    // Prevent duplicate processing
    if (processing[userId]) {
      return;
    }

    // Set processing state for this specific request
    setProcessing((prevProcessing) => ({
      ...prevProcessing,
      [userId]: true,
    }));

    setErrors("");

    try {
      const res = await apiFetch(
        "POST",
        `/api/users/friendRequest/decline/${userId}`,
      );

      if (res.ok) {
        // Optimistic update - remove declined request immediately
        setPendingRequests((prevRequests) =>
          prevRequests.filter((request) => request._id !== userId),
        );
      } else {
        const errorMessage = await handleServerError(
          res,
          "Failed to decline friend request",
        );
        setErrors(errorMessage);
      }
    } catch (error) {
      setErrors("Failed to decline friend request");
      console.log("Error declining friend request:", error);
    } finally {
      // Always clear processing state
      clearProcessingState(userId);
    }
  };

  // Load pending requests when component mounts
  useEffect(() => {
    let isMounted = true;

    const loadRequests = async () => {
      try {
        const res = await apiFetch("GET", `/api/users/friendRequests/pending`);

        if (res.ok) {
          const data = await res.json();
          // Only update state if component is still mounted
          if (isMounted) {
            setPendingRequests(data.data);
          }
        } else {
          const errorMessage = await handleServerError(
            res,
            "Failed to load friend requests",
          );
          if (isMounted) {
            setErrors(errorMessage);
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

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, []);

  // Render loading state
  if (isLoading) {
    return (
      <div>
        <h2>Friend Requests</h2>
        <p>Loading friend requests...</p>
      </div>
    );
  }

  // Render error state
  if (errors) {
    return (
      <div>
        <h2>Friend Requests</h2>
        <p>{errors}</p>
        <button onClick={fetchPendingRequests} type="button">
          Retry
        </button>
      </div>
    );
  }

  // Render empty state
  if (pendingRequests.length === 0) {
    return (
      <div>
        <h2>Friend Requests</h2>
        <p>No pending friend requests</p>
        <p>You're all caught up!</p>
      </div>
    );
  }

  // Render pending requests list
  return (
    <div>
      <h2>Friend Requests</h2>
      {pendingRequests.map((request) => (
        <div key={request._id}>
          <h3>{request.username}</h3>
          <p>wants to be your friend</p>

          <button
            onClick={() => acceptFriendRequest(request._id)}
            disabled={processing[request._id]}
            type="button"
          >
            {processing[request._id] ? "Accepting..." : "Accept"}
          </button>

          <button
            onClick={() => declineFriendRequest(request._id)}
            disabled={processing[request._id]}
            type="button"
          >
            {processing[request._id] ? "Declining..." : "Decline"}
          </button>
        </div>
      ))}
    </div>
  );
};

export default FriendRequests;
