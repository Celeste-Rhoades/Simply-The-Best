import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import routes from "@/routes";
import apiFetch from "@/services/apiFetch";
import { connectSocket, disconnectSocket } from "@/services/socket";

const ProtectedRoutes = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await apiFetch("GET", "/api/auth/myProfile");
      if (!response.ok) {
        navigate(routes.signIn);
        return;
      }

      const data = await response.json();
      setUser(data); // Store full user object (includes _id, username, etc.)

      // Connect socket with user ID
      if (data._id) {
        connectSocket(data._id);
      }

      setLoading(false);
    };

    if (user === null) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user, setUser, navigate]);

  // Disconnect socket when component unmounts
  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  if (loading) {
    return <div>Loading</div>;
  }

  return (
    <>
      <Outlet />
    </>
  );
};

export default ProtectedRoutes;
