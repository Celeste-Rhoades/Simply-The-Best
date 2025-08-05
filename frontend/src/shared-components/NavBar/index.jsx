import { useState, useEffect } from "react";
import logo1 from "../../images/logo.png";
import RedirectToSignInIfSignedOut from "shared-components/RedirectToSignInIfSignedOut";
import { useNavigate } from "react-router-dom";
import apiFetch from "services/apiFetch";

const NavBar = () => {
  const [userOpenMenu, setUserOpenMenu] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [username, setUsername] = useState(null);

  const navigate = useNavigate();

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
      <div
        className="flex justify-center bg-lighTeal"
        onMouseLeave={() => setUserOpenMenu(false)}
      >
        <div className="max-w-5xl w-full flex items-center px-4 py-2">
          <div className="w-1/4 flex justify-start">
            <img className="m-2 w-20 rounded-md" src={logo1} />
          </div>
          <div className="flex-1 md:text-5xl text-white font-manrope text-center text-3xl">
            Simply The Best
          </div>
          <div className="w-1/4 flex justify-end text-white font-raleway md:text-xl">
            <div className="relative min-w-44">
              <button
                type="button"
                className="flex items-center"
                onClick={() => setUserOpenMenu(true)}
              >
                <i className="fa-solid fa-user m-1"></i>
                <span className="ml-2">
                  {username === null
                    ? "Loading..."
                    : username
                    ? username
                    : "Guest"}
                </span>
              </button>
              {userOpenMenu && (
                <div className="absolute bottom-[-44px] rounded-md shadow-md left-0 bg-lightTanGray text-stone-800 text-lg px-10 py-4 flex flex-col">
                  <button
                    className="hover:text-cerulean mb-2 text-left"
                    onClick={() => {
                      setUserOpenMenu(false);
                      navigate("/my-profile");
                    }}
                  >
                    <i className="mr-2 fa-solid fa-user"></i>
                    Profile
                  </button>
                  {showSignOut ? (
                    <RedirectToSignInIfSignedOut />
                  ) : (
                    <button
                      className="hover:text-cerulean text-left"
                      onClick={() => setShowSignOut(true)}
                    >
                      <i className="mr-2 fa-solid fa-arrow-right-from-bracket"></i>
                      Sign out
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;