import { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../../App";
import routes from "../../routes";
import logo1 from "../../images/logo.png";
import FriendRequestsDropdown from "../../Components/FriendRequestsDropdown";
import SearchBar from "../SearchBar";
import ThemeToggle from "../../Components/ThemeToggle";
import apiFetch from "../../services/apiFetch";
import { disconnectSocket } from "../../services/socket";

const NavBar = () => {
  const { user, setUser } = useContext(AppContext);
  const [userOpenMenu, setUserOpenMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const logout = async () => {
    const response = await apiFetch("POST", "/api/auth/logout");
    if (response.ok) {
      disconnectSocket();
      setUser(null);
      navigate(routes.signIn);
    }
  };

  const handleDeleteAccount = async () => {
    const response = await apiFetch("DELETE", "/api/auth/account");
    if (response.ok) {
      disconnectSocket();
      setUser(null);
      navigate(routes.landing);
    }
    setShowDeleteModal(false);
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (userOpenMenu) setUserOpenMenu(false);
        if (showDeleteModal) setShowDeleteModal(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [userOpenMenu, showDeleteModal]);

  const username = user === null ? "Loading..." : user?.username || "Guest";

  return (
    <nav
      className="bg-laguna relative z-40 flex justify-center"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="relative flex w-full max-w-7xl items-center justify-between px-2 py-2 sm:px-4 md:px-6">
        {/* Logo */}
        <div className="font-header flex items-center text-xl text-white">
          <Link to={routes.recommendations} aria-label="Home">
            <img
              className="h-16 w-16 object-contain sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28"
              alt="Simply The Best logo"
              src={logo1}
            />
          </Link>
        </div>

        {/* Center title */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link to={routes.recommendations}>
            <h1 className="font-header text-center text-lg whitespace-nowrap text-white select-none sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl">
              Simply The Best
            </h1>
          </Link>
        </div>

        {/* Right navigation */}
        <div className="font-body flex items-center justify-end gap-1 text-white sm:gap-4 md:gap-6">
          {/* Desktop navigation (XL+) */}
          <div className="hidden items-center space-x-3 xl:flex">
            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                className="flex items-center space-x-2 rounded-md border border-white/30 bg-white/10 px-2 py-1 text-sm leading-tight transition-colors hover:border-white/50 hover:bg-white/20"
                onClick={() => setUserOpenMenu(!userOpenMenu)}
                aria-expanded={userOpenMenu}
                aria-haspopup="true"
                aria-label="User menu"
                title={username}
              >
                <span className="inline-block max-w-[88px] truncate">
                  {username}
                </span>
                <i className="fa-solid fa-caret-down" aria-hidden="true"></i>
              </button>

              {userOpenMenu && (
                <>
                  <div
                    className="fixed inset-0 z-[9998]"
                    onClick={() => setUserOpenMenu(false)}
                    aria-hidden="true"
                  ></div>
                  <div
                    className="bg-lightTanGray absolute top-12 right-0 z-[9999] flex h-auto max-h-96 flex-col overflow-y-auto rounded-md px-3 py-4 text-base text-stone-800 shadow-md"
                    style={{ minWidth: "288px" }}
                    role="menu"
                    aria-label="User menu"
                  >
                    <div className="mb-3 border-b border-stone-300 pb-2">
                      <span className="font-body text-sm text-stone-600">
                        Signed in as:
                      </span>
                      <div className="font-header">{username}</div>
                    </div>

                    <button
                      className="font-body hover:text-cerulean mb-2 py-1 text-left"
                      onClick={() => {
                        setUserOpenMenu(false);
                        navigate(routes.recommendations);
                      }}
                      role="menuitem"
                    >
                      <i
                        className="fa-solid fa-house mr-2"
                        aria-hidden="true"
                      ></i>
                      Home
                    </button>
                    <button
                      className="font-body hover:text-cerulean mb-2 py-1 text-left"
                      onClick={() => {
                        setUserOpenMenu(false);
                        navigate(routes.myRecommendations);
                      }}
                      role="menuitem"
                    >
                      <i
                        className="fa-solid fa-user mr-2"
                        aria-hidden="true"
                      ></i>
                      My Recommendations
                    </button>
                    <button
                      className="font-body hover:text-cerulean mb-2 py-1 text-left"
                      onClick={() => {
                        setUserOpenMenu(false);
                        navigate(routes.friends);
                      }}
                      role="menuitem"
                    >
                      <i
                        className="fa-solid fa-user-group mr-2"
                        aria-hidden="true"
                      ></i>
                      Friends
                    </button>

                    <button
                      className="font-body hover:text-cerulean mb-3 py-1 text-left"
                      onClick={() => {
                        setUserOpenMenu(false);
                        logout();
                      }}
                      role="menuitem"
                    >
                      <i
                        className="fa-solid fa-arrow-right-from-bracket mr-2"
                        aria-hidden="true"
                      ></i>
                      Sign out
                    </button>

                    {/* Delete Account - Separate Section */}
                    <div className="border-t border-stone-300 pt-3">
                      <button
                        className="font-body py-1 text-left text-red-600 transition-colors hover:text-red-700"
                        onClick={() => {
                          setUserOpenMenu(false);
                          setShowDeleteModal(true);
                        }}
                        role="menuitem"
                      >
                        <i
                          className="fa-solid fa-trash mr-2"
                          aria-hidden="true"
                        ></i>
                        Delete Account
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Friend requests notification */}
            <FriendRequestsDropdown />

            <ThemeToggle />
            <SearchBar />
          </div>

          {/* Mobile navigation (below XL) */}
          <div className="flex items-center gap-2 xl:hidden">
            <FriendRequestsDropdown />

            <div className="relative z-50">
              <button
                type="button"
                className="flex h-8 w-8 flex-col items-center justify-center space-y-1"
                onClick={() => setUserOpenMenu(!userOpenMenu)}
                aria-expanded={userOpenMenu}
                aria-haspopup="true"
                aria-label="Open menu"
              >
                <span
                  className="h-0.5 w-6 bg-white transition-all duration-300"
                  aria-hidden="true"
                ></span>
                <span
                  className="h-0.5 w-6 bg-white transition-all duration-300"
                  aria-hidden="true"
                ></span>
                <span
                  className="h-0.5 w-6 bg-white transition-all duration-300"
                  aria-hidden="true"
                ></span>
              </button>

              {userOpenMenu && (
                <>
                  <div
                    className="fixed inset-0 z-[9998]"
                    onClick={() => setUserOpenMenu(false)}
                    aria-hidden="true"
                  ></div>
                  <div
                    className="bg-lightTanGray absolute top-12 right-0 z-[9999] flex h-auto max-h-96 flex-col overflow-y-auto rounded-md px-3 py-4 text-lg text-stone-800 shadow-md"
                    style={{ minWidth: "160px" }}
                    role="menu"
                    aria-label="Mobile menu"
                  >
                    <div className="mb-3 border-b border-stone-300 pb-2">
                      <span className="font-body text-sm text-stone-600">
                        Signed in as:
                      </span>
                      <div className="font-header">{username}</div>
                    </div>

                    <button
                      className="font-body hover:text-cerulean mb-2 py-1 text-left"
                      onClick={() => {
                        setUserOpenMenu(false);
                        setShowSearchModal(true);
                      }}
                      role="menuitem"
                    >
                      <i
                        className="fa-solid fa-magnifying-glass mr-2 w-5"
                        aria-hidden="true"
                      ></i>
                      <span>Find Friends</span>
                    </button>

                    <button
                      className="font-body hover:text-cerulean mb-2 py-1 text-left"
                      onClick={() => {
                        setUserOpenMenu(false);
                        navigate(routes.recommendations);
                      }}
                      role="menuitem"
                    >
                      <i
                        className="fa-solid fa-house mr-2 w-5"
                        aria-hidden="true"
                      ></i>
                      <span>Home</span>
                    </button>

                    <button
                      className="font-body hover:text-cerulean mb-2 py-1 text-left"
                      onClick={() => {
                        setUserOpenMenu(false);
                        navigate(routes.myRecommendations);
                      }}
                      role="menuitem"
                    >
                      <i
                        className="fa-solid fa-user mr-2 w-5"
                        aria-hidden="true"
                      ></i>
                      <span>My Recommendations</span>
                    </button>

                    <button
                      className="font-body hover:text-cerulean mb-2 py-1 text-left"
                      onClick={() => {
                        setUserOpenMenu(false);
                        navigate(routes.friends);
                      }}
                      role="menuitem"
                    >
                      <i
                        className="fa-solid fa-user-group mr-2 w-5"
                        aria-hidden="true"
                      ></i>
                      <span>Friends</span>
                    </button>

                    <ThemeToggle isMobile />

                    <button
                      className="font-body hover:text-cerulean mb-3 py-1 text-left"
                      onClick={() => {
                        setUserOpenMenu(false);
                        logout();
                      }}
                      role="menuitem"
                    >
                      <i
                        className="fa-solid fa-arrow-right-from-bracket mr-2 w-5"
                        aria-hidden="true"
                      ></i>
                      <span>Sign out</span>
                    </button>

                    {/* Delete Account - Separate Section */}
                    <div className="border-t border-stone-300 pt-3">
                      <button
                        className="font-body py-1 text-left text-red-600 transition-colors hover:text-red-700"
                        onClick={() => {
                          setUserOpenMenu(false);
                          setShowDeleteModal(true);
                        }}
                        role="menuitem"
                      >
                        <i
                          className="fa-solid fa-trash mr-2 w-5"
                          aria-hidden="true"
                        ></i>
                        <span>Delete Account</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search modal */}
      <SearchBar
        isVisible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        mobileOnly={true}
      />

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <>
          <div
            className="fixed inset-0 z-[10000] bg-black/60"
            onClick={() => setShowDeleteModal(false)}
          ></div>
          <div className="fixed top-1/2 left-1/2 z-[10001] w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl">
            <h3 className="font-header mb-4 text-xl text-gray-800">
              Delete Account?
            </h3>
            <p className="font-body mb-6 text-gray-600">
              Are you sure you want to delete your account? This will
              permanently remove all your recommendations, friends, and data.
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="font-body flex-1 rounded-md bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="font-body flex-1 rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default NavBar;
