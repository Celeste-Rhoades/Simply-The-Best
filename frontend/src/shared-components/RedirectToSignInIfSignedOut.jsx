import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiFetch from "services/apiFetch";

const RedirectToSignedInIfSignedOut = (props) => {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
     await apiFetch("POST", "/api/auth/logout");

          navigate("/");
      }
      logout()
  }, [navigate]);

  return props.children;
};

export default RedirectToSignedInIfSignedOut;