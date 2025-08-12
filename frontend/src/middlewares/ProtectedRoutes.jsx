import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom";

import apiFetch from "@/services/apiFetch";

const ProtectedRoutes = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await apiFetch("GET", "/api/auth/myProfile");
      if (!response.ok) {
        navigate("/")
      }
    };

    fetchProfile();
  }, [])

  return <Outlet />
}

export default ProtectedRoutes