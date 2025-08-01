import { useEffect, useState } from "react";
import logo1 from "../../images/logo.png";
import apiFetch from "services/apiFetch";

const NavBar = () => {
  const [username, setUsername] = useState(null); 

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await apiFetch("GET", "/api/auth/myProfile");
      if (response.ok) {
        const data = await response.json();
        setUsername(data.username);
      } else {
        setUsername(""); 
      }
    };
    fetchProfile();
  }, []);

  return (
    <nav>
      <div className="flex justify-center bg-lighTeal ">
        <div className="max-w-6xl w-full flex items-center justify-between px-4 py-2" >
          <div className="">
            <img className="m-4 w-20 rounded-md" src={logo1} />
          </div>
          <div className="text-5xl text-white font-manrope">Simply The Best</div>
          <div className="m-2 text-white font-raleway">
            <button>
              <i className="fa-solid fa-user m-4"></i>
              {username === null
                ? "Loading..."
                : username
                ? username
                : "Guest"}
           </button>
            <button className="m-10">Sign up</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;