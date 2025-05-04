import { useContext, useEffect } from "react";
import SessionContext from "contexts/sessionContext";
import { useNavigate } from "react-router-dom";

const RedirectToRecommendIfSignedIn = props => {
  const { username } = useContext(SessionContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (username !== null) {
      navigate("/recommend");
    }
  }, [username, navigate]);

  return props.children;
};

export default RedirectToRecommendIfSignedIn;
