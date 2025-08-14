import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom";

import routes from "@/routes"

import apiFetch from "@/services/apiFetch";

const GuestRoutes = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      const response = await apiFetch("GET", "/api/auth/myProfile");
      if (response.ok) {
        navigate(routes.recommendations); 
      }
    };

    checkAuth();
  }, [])

  return <Outlet />
}

export default GuestRoutes