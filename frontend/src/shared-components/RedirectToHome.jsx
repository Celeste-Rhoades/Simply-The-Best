import React from 'react'
import { useEffect} from "react";
import { useNavigate } from "react-router-dom";



const RedirectToHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/recommendation");
  }, [navigate]);

  return null;
};

export default RedirectToHome;