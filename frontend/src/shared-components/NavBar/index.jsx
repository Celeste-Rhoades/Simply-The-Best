import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";

import routes from "../../routes";
import apiFetch from "../../services/apiFetch";
import { AppContext } from "../../App";

// Import existing components
import SearchBar from "../../Components/SearchBar";
import FriendRequestsDropdown from "../../Components/FriendRequestsDropdown";

import logo1 from "../../images/logo.png";

const NavBar = () => {
  const { username, setUsername } = useContext(AppContext);
  const [userOpenMenu, setUserOpenMenu] = useState(false);
  const navigate = useNavigate();

  const logout = async () => {
    const response = await apiFetch("POST", "/api/auth/logout");
    if (response.ok) {
      setUsername(null);
      navigate(routes.signIn);
    }
  };

  return (
    <nav
      className="bg-laguna relative z-40 flex justify-center"
      onMouseLeave={() => setUserOpenMenu(false)}
    >
      <div className="relative flex w-full max-w-7xl items-center justify-between px-2 py-2 sm:px-4 md:px-6">
        {/* Left Section - Logo */}
        <div className="font-playfair flex items-center text-xl text-white">
          <Link to="/">
            <img
              className="h-16 w-16 object-contain sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28"
              alt="starfish"
              src={logo1}
            />
          </Link>
        </div>

        {/* Center Section - Title (Always Centered) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link to="/">
            <h1 className="font-manrope text-center text-xl whitespace-nowrap text-white select-none sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
              Simply The Best
            </h1>
          </Link>
        </div>

        {/* Right Section - Desktop Navigation (XL screens only) */}
        <div className="font-raleway hidden items-center justify-end space-x-6 text-white xl:flex">
          {/* User Menu */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center rounded-lg py-2 text-lg transition-colors"
              onClick={() => setUserOpenMenu(!userOpenMenu)}
            >
              <i className="fa-solid fa-user mr-2"></i>
              <span>
                {username === null
                  ? "Loading..."
                  : username
                    ? username
                    : "Guest"}
              </span>
            </button>

            {userOpenMenu && (
              <div className="bg-lightTanGray absolute top-full right-0 mt-2 flex min-w-65 flex-col rounded-md px-6 py-4 text-lg text-stone-800 shadow-md">
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
                  className="hover:text-cerulean mb-2 py-1 text-left"
                  onClick={() => {
                    setUserOpenMenu(false);
                    navigate(routes.friends);
                  }}
                >
                  <i className="fa-solid fa-user-group mr-2"></i>
                  Friends
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

          {/* Friend Requests Notification */}
          <FriendRequestsDropdown />

          {/* Search Bar - Only on XL+ screens */}
          <SearchBar />
        </div>

        {/* Mobile/Tablet Navigation (XS-L screens) */}
        <div className="font-raleway flex items-center justify-end space-x-3 text-white sm:space-x-4 xl:hidden">
          {/* Mobile Friend Requests Notification */}
          <FriendRequestsDropdown />

          {/* Hamburger Menu */}
          <div className="relative z-50">
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
              <div className="bg-lightTanGray absolute top-12 right-0 z-[9999] flex min-w-48 flex-col rounded-md px-6 py-4 text-lg text-stone-800 shadow-md">
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

                {/* Mobile Search Section */}
                <div className="mb-3 border-b border-stone-300 pb-3">
                  <button
                    className="hover:text-cerulean mb-2 w-full py-1 text-left"
                    onClick={() => {
                      setUserOpenMenu(false);
                      navigate(routes.userSearch);
                    }}
                  >
                    <i className="fa-solid fa-magnifying-glass mr-2"></i>
                    Find Friends
                  </button>
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
                  My Recommendations
                </button>
                <button
                  className="hover:text-cerulean mb-2 py-1 text-left"
                  onClick={() => {
                    setUserOpenMenu(false);
                    navigate(routes.friends);
                  }}
                >
                  <i className="fa-solid fa-user-group mr-2"></i>
                  Friends
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
