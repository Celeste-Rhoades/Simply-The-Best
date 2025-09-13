import { React, useState, useEffect } from "react";
import apiFetch from "../path/to/your/apiFetch"; // Use the correct path

const FriendRequests = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState("");
  const [processingActions, setProcessing] = useState({});

  const fetchPendingRequests = async () => {
    setIsLoading(true);
    setErrors("");

    try {
      const res = await apiFetch("GET", `/api/users/friendRequests/pending`);
    } catch (error) {}
  };

  return <div>FriendRequest</div>;
};

export default FriendRequests;
