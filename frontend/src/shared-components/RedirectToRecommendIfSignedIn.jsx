import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiFetch from "services/apiFetch";

const RedirectToRecommendationIfSignedIn = (props) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const response = await apiFetch("GET", "/api/auth/myProfile");
      if (response.ok) {
        navigate("/recommendation"); 
      }
      
    };
    checkAuth();
  }, [navigate]);

  return props.children;
};

export default RedirectToRecommendationIfSignedIn;