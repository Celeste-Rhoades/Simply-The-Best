import { useState, useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom";

import routes from "@/routes"
import apiFetch from "@/services/apiFetch";

const ProtectedRoutes = ({ username, setUsername }) => {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await apiFetch("GET", "/api/auth/myProfile");
      if (!response.ok) {
        navigate(routes.signIn)
      }

      const data = await response.json()
      setUsername(data.username)

      setLoading(false)
    };

    if (username === null) {
      fetchProfile();
    } else {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return <div>Loading</div>
  }

  return <Outlet />
}

export default ProtectedRoutes