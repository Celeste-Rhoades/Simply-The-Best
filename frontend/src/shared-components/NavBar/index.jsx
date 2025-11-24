import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";

import routes from "../../routes";
import apiFetch from "../../services/apiFetch";
import { AppContext } from "../../App";

// Import new components
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
      <div className="relative flex w-full max-w-7xl items-center px-6 py-2">
        {/* Left Section - Logo */}
        <div className="font-playfair flex flex-1 items-center text-xl text-white">
          <Link to="/">
            <img
              className="h-28 w-28 object-contain md:h-38 md:w-38"
              alt="starfish"
              src={logo1}
            />
          </Link>
        </div>

        {/* Center Section - Title */}
        <div className="flex flex-1 justify-center">
          <Link to="/">
            <h1 className="font-manrope text-center text-2xl whitespace-nowrap text-white select-none md:text-xl lg:text-4xl xl:text-5xl">
              Simply The Best
            </h1>
          </Link>
        </div>

        {/* Right Section - Navigation */}
        <div className="font-raleway hidden flex-1 items-center justify-end space-x-6 text-white md:flex">
          {/* User Menu - First */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center rounded-lg py-2 pl-11 text-lg transition-colors"
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

          {/* Friend Requests Notification - Second */}
          <FriendRequestsDropdown />

          {/* Search Bar - Third */}
          <SearchBar />
        </div>

        {/* Mobile hamburger menu */}
        <div className="font-raleway flex flex-1 items-center justify-end space-x-4 text-white md:hidden">
          {/* Mobile Friend Requests Notification */}
          <FriendRequestsDropdown />

          {/* Mobile Hamburger Menu */}
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
                    Search Users
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
