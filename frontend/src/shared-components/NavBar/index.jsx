import { useState, useEffect } from "react";
import logo1 from "../../images/logo.png";
import RedirectToSignInIfSignedOut from "shared-components/RedirectToSignInIfSignedOut";
import { useNavigate, Link } from "react-router-dom";
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
        setUsername(""); // Not authenticated
      }
    };
    fetchProfile();
  }, []);

  if (username === undefined) {
    return null;
  }

  return (
    <nav
      className="bg-lighTeal flex justify-center"
      onMouseLeave={() => setUserOpenMenu(false)}
    >
      <div className="relative flex w-full max-w-5xl items-center px-6 py-2">
        <div className="font-playfair flex flex-1 items-center text-xl text-white">
          <img
            className="h-38 w-38 object-contain"
            alt="starfish"
            src={logo1}
          />
        </div>

        <h1 className="font-manrope pointer-events-none text-center text-xl whitespace-nowrap text-white select-none lg:text-4xl xl:text-5xl">
          Simply The Best
        </h1>

        <div className="font-raleway hidden flex-1 justify-end text-white sm:flex">
          <div className="relative min-w-44">
            <button
              type="button"
              className="flex items-center text-lg"
              onClick={() => setUserOpenMenu(true)}
            >
              <i className="fa-solid fa-user m-1"></i>
              <span className="">
                {username === null
                  ? "Loading..."
                  : username
                    ? username
                    : "Guest"}
              </span>
            </button>
            {userOpenMenu && (
              <div className="bg-lightTanGray absolute bottom-[-88px] left-0 flex flex-col rounded-md px-10 py-4 text-lg text-stone-800 shadow-md">
                <button
                  className="hover:text-cerulean mb-2 text-left"
                  onClick={() => {
                    setUserOpenMenu(false);
                    navigate("/recommendation");
                  }}
                >
                  <i className="fa-solid fa-house mr-2"></i>
                  Home
                </button>
                <button
                  className="hover:text-cerulean mb-2 text-left"
                  onClick={() => {
                    setUserOpenMenu(false);
                    navigate("/my-profile");
                  }}
                >
                  <i className="fa-solid fa-user mr-2"></i>
                  Profile
                </button>
                {showSignOut ? (
                  <RedirectToSignInIfSignedOut />
                ) : (
                  <button
                    className="hover:text-cerulean text-left"
                    onClick={() => setShowSignOut(true)}
                  >
                    <i className="fa-solid fa-arrow-right-from-bracket mr-2"></i>
                    Sign out
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
