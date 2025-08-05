import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RedirectToProfile = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/my-profile");
  }, [navigate]);

  return null;
};

export default RedirectToProfile;