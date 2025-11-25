import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import apiFetch from "../services/apiFetch";
import { AppContext } from "../App";
import routes from "../routes";
import logo1 from "../images/logo.png";

const UserSearch = () => {
  const { username, setUsername } = useContext(AppContext);
  const [userOpenMenu, setUserOpenMenu] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [requestStatus, setRequestStatus] = useState({});

  const logout = async () => {
    const response = await apiFetch("POST", "/api/auth/logout");
    if (response.ok) {
      setUsername(null);
      navigate(routes.signIn);
    }
  };

  const handleSearch = useCallback(async () => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      setSearchError("");
      return;
    }

    setIsLoading(true);
    setSearchError("");

    try {
      const res = await apiFetch(
        "GET",
        `/api/users/search?search=${searchTerm}`,
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.data);
      } else {
        setSearchError("Failed to search users");
      }
    } catch (err) {
      setSearchError("Network error. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
        setSearchError("");
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, handleSearch]);

  const sendFriendRequest = useCallback(async (userId) => {
    try {
      setRequestStatus((prev) => ({
        ...prev,
        [userId]: "loading",
      }));

      const res = await apiFetch(
        "POST",
        `/api/users/friendRequest/send/${userId}`,
      );

      if (res.ok) {
        setRequestStatus((prev) => ({
          ...prev,
          [userId]: "sent",
        }));

        setSearchResults((prevResults) =>
          prevResults.map((user) =>
            user._id === userId ? { ...user, isPendingRequest: true } : user,
          ),
        );
      } else {
        const errorData = await res.json();
        setRequestStatus((prev) => ({
          ...prev,
          [userId]: "error",
        }));
        console.error("Friend request failed:", errorData.error);
      }
    } catch (error) {
      setRequestStatus((prev) => ({
        ...prev,
        [userId]: "error",
      }));
      console.error("Network error sending friend request:", error);
    }
  }, []);

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-lightTanGray"}`}
    >
      {/* Navbar - Matches main NavBar responsive design */}
      <nav className="bg-laguna relative z-40 flex justify-center">
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

          {/* Right Section - Hamburger Menu */}
          <div className="font-raleway flex items-center justify-end text-white">
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
                    <span className="text-sm text-stone-600">
                      Signed in as:
                    </span>
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

      {/* Search Content */}
      <div className="p-4">
        <h1 className="mb-4 text-center text-2xl font-bold text-gray-800">
          Find Friends
        </h1>

        {/* Search Input */}
        <div className="relative mx-auto mb-6 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setUserOpenMenu(false)}
            placeholder="Search for friends by username..."
            className="focus:border-cerulean w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pl-12 text-gray-900 placeholder-gray-500 focus:outline-none"
          />
          <i className="fa-solid fa-magnifying-glass absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"></i>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="py-4 text-center">
            <p className="text-gray-600">Searching...</p>
          </div>
        )}

        {/* Error */}
        {searchError && (
          <div className="py-4 text-center">
            <p className="text-red-600">{searchError}</p>
          </div>
        )}

        {/* Results */}
        {searchResults.length > 0 && (
          <div className="mx-auto max-w-md space-y-3">
            {searchResults.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
              >
                <span className="font-medium text-gray-900">
                  {user.username}
                </span>

                {user.isFriend ? (
                  <span className="rounded bg-green-100 px-3 py-1 text-sm text-green-700">
                    Friends
                  </span>
                ) : user.isPendingRequest ||
                  requestStatus[user._id] === "sent" ? (
                  <span className="rounded bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
                    Request Sent
                  </span>
                ) : (
                  <button
                    onClick={() => sendFriendRequest(user._id)}
                    disabled={requestStatus[user._id] === "loading"}
                    className={`rounded px-3 py-1 text-sm font-medium ${
                      requestStatus[user._id] === "loading"
                        ? "cursor-not-allowed bg-gray-400 text-white"
                        : "bg-hotCoralPink text-white hover:bg-pink-600"
                    }`}
                  >
                    {requestStatus[user._id] === "loading"
                      ? "Sending..."
                      : "Add Friend"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {searchResults.length === 0 &&
          !isLoading &&
          !searchError &&
          searchTerm.trim() && (
            <div className="py-4 text-center">
              <p className="text-gray-600">No users found</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default UserSearch;
