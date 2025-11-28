import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../../App";
import routes from "../../routes";
import logo1 from "../../images/logo.png";
import FriendRequestsDropdown from "../../Components/FriendRequestsDropdown";
import SearchBar from "../../Components/SearchBar";
import ThemeToggle from "../../Components/ThemeToggle";
import apiFetch from "../../services/apiFetch";
import { disconnectSocket } from "../../services/socket";

const NavBar = () => {
  const { user, setUser } = useContext(AppContext);
  const [userOpenMenu, setUserOpenMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const navigate = useNavigate();

  const logout = async () => {
    const response = await apiFetch("POST", "/api/auth/logout");
    if (response.ok) {
      disconnectSocket();
      setUser(null);
      navigate(routes.signIn);
    }
  };

  return (
    <nav className="bg-laguna relative z-40 flex justify-center">
      <div className="relative flex w-full max-w-7xl items-center justify-between px-2 py-2 sm:px-4 md:px-6">
        {/* Left Section - Logo */}
        <div className="font-playfair flex items-center text-xl text-white">
          <Link to={routes.recommendations}>
            <img
              className="h-16 w-16 object-contain sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28"
              alt="starfish"
              src={logo1}
            />
          </Link>
        </div>

        {/* Center Section - Title (Absolutely Positioned, Always Centered) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link to={routes.recommendations}>
            <h1 className="font-manrope text-center text-2xl whitespace-nowrap text-white select-none sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl">
              Simply The Best
            </h1>
          </Link>
        </div>

        {/* Right Section - Navigation */}
        <div className="font-raleway flex items-center justify-end gap-1 text-white sm:gap-4 md:gap-6">
          {/* Bell Notification - Always Visible */}
          <FriendRequestsDropdown />

          {/* Desktop Navigation - XL+ screens */}
          <div className="hidden items-center space-x-6 xl:flex">
            {/* User Dropdown */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center space-x-2 text-base transition-colors hover:text-gray-200"
                onClick={() => setUserOpenMenu(!userOpenMenu)}
              >
                <span>
                  {user === null ? "Loading..." : user?.username || "Guest"}
                </span>
                <i className="fa-solid fa-caret-down"></i>
              </button>

              {userOpenMenu && (
                <>
                  {/* Backdrop - click to close */}
                  <div
                    className="fixed inset-0 z-[9998]"
                    onClick={() => setUserOpenMenu(false)}
                  ></div>

                  {/* Dropdown Menu */}
                  <div className="bg-lightTanGray absolute top-12 right-0 z-[9999] flex min-w-48 flex-col rounded-md px-6 py-4 text-base text-stone-800 shadow-md">
                    <div className="mb-3 border-b border-stone-300 pb-2">
                      <span className="text-sm text-stone-600">
                        Signed in as:
                      </span>
                      <div className="font-semibold">
                        {user === null
                          ? "Loading..."
                          : user?.username || "Guest"}
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
                      onClick={() => {
                        setUserOpenMenu(false);
                        logout();
                      }}
                    >
                      <i className="fa-solid fa-arrow-right-from-bracket mr-2"></i>
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Theme Toggle - Desktop */}
            <ThemeToggle />

            {/* SearchBar Modal */}
            <SearchBar />
          </div>

          {/* Mobile Hamburger Menu - XS to L screens */}
          <div className="relative z-50 xl:hidden">
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
              <>
                {/* Backdrop - click to close */}
                <div
                  className="fixed inset-0 z-[9998]"
                  onClick={() => setUserOpenMenu(false)}
                ></div>

                {/* Dropdown Menu */}
                <div className="bg-lightTanGray absolute top-12 right-0 z-[9999] flex min-w-48 flex-col rounded-md px-6 py-4 text-lg text-stone-800 shadow-md">
                  <div className="mb-3 border-b border-stone-300 pb-2">
                    <span className="text-sm text-stone-600">
                      Signed in as:
                    </span>
                    <div className="font-semibold">
                      {user === null ? "Loading..." : user?.username || "Guest"}
                    </div>
                  </div>

                  <button
                    className="hover:text-cerulean mb-2 py-1 text-left"
                    onClick={() => {
                      setUserOpenMenu(false);
                      setShowSearchModal(true);
                    }}
                  >
                    <i className="fa-solid fa-magnifying-glass mr-2 w-5"></i>
                    <span>Find Friends</span>
                  </button>

                  <button
                    className="hover:text-cerulean mb-2 py-1 text-left"
                    onClick={() => {
                      setUserOpenMenu(false);
                      navigate(routes.recommendations);
                    }}
                  >
                    <i className="fa-solid fa-house mr-2 w-5"></i>
                    <span>Home</span>
                  </button>

                  <button
                    className="hover:text-cerulean mb-2 py-1 text-left"
                    onClick={() => {
                      setUserOpenMenu(false);
                      navigate(routes.myRecommendations);
                    }}
                  >
                    <i className="fa-solid fa-user mr-2 w-5"></i>
                    <span>My Recommendations</span>
                  </button>

                  <button
                    className="hover:text-cerulean mb-2 py-1 text-left"
                    onClick={() => {
                      setUserOpenMenu(false);
                      navigate(routes.friends);
                    }}
                  >
                    <i className="fa-solid fa-user-group mr-2 w-5"></i>
                    <span>Friends</span>
                  </button>

                  {/* Theme Toggle - Mobile */}
                  <ThemeToggle isMobile />

                  <button
                    className="hover:text-cerulean py-1 text-left"
                    onClick={() => {
                      setUserOpenMenu(false);
                      logout();
                    }}
                  >
                    <i className="fa-solid fa-arrow-right-from-bracket mr-2 w-5"></i>
                    <span>Sign out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Modal - XL screens and below */}
      <SearchBar
        isVisible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        mobileOnly={true}
      />
    </nav>
  );
};

export default NavBar;
