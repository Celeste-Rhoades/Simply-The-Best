import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import routes from "@/routes"
import apiFetch from "services/apiFetch";

import logo1 from "../../images/logo.png";

const NavBar = () => {
  const [userOpenMenu, setUserOpenMenu] = useState(false);
  const [username, setUsername] = useState(null);

  const navigate = useNavigate();

  const logout = async () => {
    const response = await apiFetch("POST", "/api/auth/logout");

    if (response.ok) {
      navigate(routes.signIn);
    }
  }

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
        <div className="font-playfair flex items-center text-xl text-white md:flex-1">
          <Link to="/">
            <img
              className="h-28 w-28 object-contain md:h-38 md:w-38"
              alt="starfish"
              src={logo1}
            />
          </Link>
        </div>
        <Link to="/">
          <h1 className="font-manrope pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-2xl whitespace-nowrap text-white select-none md:relative md:top-auto md:left-auto md:flex-none md:translate-x-0 md:translate-y-0 md:text-xl lg:text-4xl xl:text-5xl">
            Simply The Best
          </h1>
        </Link>
        <div className="font-raleway hidden flex-1 justify-end text-white md:flex">
          <div className="relative min-w-44">
            <button
              type="button"
              className="flex items-center text-lg"
              onClick={() => setUserOpenMenu(!userOpenMenu)}
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
              <div className="bg-lightTanGray absolute top-8 right-0 flex min-w-65 flex-col rounded-md px-6 py-4 text-lg text-stone-800 shadow-md">
                <button
                  className="hover:text-cerulean mb-2 py-1 text-left"
                  onClick={() => {
                    setUserOpenMenu(false);
                    navigate(routes.recommendations);
                  }}
                >
                  <i className="fa-solid fa-house mr-2"></i>
                  Home
                </button>
                <button
                  className="hover:text-cerulean mb-2 py-1 text-left"
                  onClick={() => {
                    setUserOpenMenu(false);
                    navigate(routes.myRecommendations);
                  }}
                >
                  <i className="fa-solid fa-user mr-2"></i>
                  My Recommendations
                </button>
                <button
                  className="hover:text-cerulean py-1 text-left"
                  onClick={() => logout()}
                >
                  <i className="fa-solid fa-arrow-right-from-bracket mr-2"></i>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* hamburger menu */}
        <div className="font-raleway flex flex-1 justify-end text-white md:hidden">
          <div className="relative">
            <button
              type="button"
              className="flex h-8 w-8 flex-col items-center justify-center space-y-1"
              onClick={() => setUserOpenMenu(!userOpenMenu)}
            >
              <span className="h-0.5 w-6 bg-white transition-all duration-300"></span>
              <span className="h-0.5 w-6 bg-white transition-all duration-300"></span>
              <span className="h-0.5 w-6 bg-white transition-all duration-300"></span>
            </button>
            {userOpenMenu && (
              <div className="bg-lightTanGray absolute top-12 right-0 flex min-w-48 flex-col rounded-md px-6 py-4 text-lg text-stone-800 shadow-md">
                <div className="mb-3 border-b border-stone-300 pb-2">
                  <span className="text-sm text-stone-600">Signed in as:</span>
                  <div className="font-semibold">
                    {username === null
                      ? "Loading..."
                      : username
                        ? username
                        : "Guest"}
                  </div>
                </div>
                <button
                  className="hover:text-cerulean mb-2 py-1 text-left"
                  onClick={() => {
                    setUserOpenMenu(false);
                    navigate(routes.recommendations);
                  }}
                >
                  <i className="fa-solid fa-house mr-2"></i>
                  Home
                </button>
                <button
                  className="hover:text-cerulean mb-2 py-1 text-left"
                  onClick={() => {
                    setUserOpenMenu(false);
                    navigate(routes.myRecommendations);
                  }}
                >
                  <i className="fa-solid fa-user mr-2"></i>
                  Profile
                </button>
                <button
                  className="hover:text-cerulean py-1 text-left"
                  onClick={() => logout()}
                >
                  <i className="fa-solid fa-arrow-right-from-bracket mr-2"></i>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
