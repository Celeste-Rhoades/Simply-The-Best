import { useState, useEffect, useCallback } from "react";
import apiFetch from "../services/apiFetch";
import socket from "../services/socket";

const SearchBar = ({
  isVisible = false,
  onClose = () => {},
  mobileOnly = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [requestStatus, setRequestStatus] = useState({});
  const [isOpen, setIsOpen] = useState(false);

  // For desktop self-contained modal
  const handleOpenModal = () => setIsOpen(true);
  const handleCloseModal = () => {
    setIsOpen(false);
    setSearchTerm("");
    setSearchResults([]);
  };

  // For mobile controlled modal
  useEffect(() => {
    if (!isVisible && mobileOnly) {
      setSearchTerm("");
      setSearchResults([]);
    }
  }, [isVisible, mobileOnly]);

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

  // Socket listeners for real-time search result updates
  useEffect(() => {
    // When someone accepts your friend request
    socket.on("friendRequestAccepted", (data) => {
      setSearchResults((prevResults) =>
        prevResults.map((user) =>
          user._id === data.acceptorId
            ? { ...user, isFriend: true, isPendingRequest: false }
            : user,
        ),
      );

      // Clear request status
      setRequestStatus((prev) => {
        const newStatus = { ...prev };
        delete newStatus[data.acceptorId];
        return newStatus;
      });
    });

    // When someone removes you as a friend
    socket.on("friendRemoved", (data) => {
      setSearchResults((prevResults) =>
        prevResults.map((user) =>
          user._id === data.removedBy
            ? { ...user, isFriend: false, isPendingRequest: false }
            : user,
        ),
      );
    });

    // When someone declines your friend request
    socket.on("friendRequestDeclined", (data) => {
      setSearchResults((prevResults) =>
        prevResults.map((user) =>
          user._id === data.declinedBy
            ? { ...user, isPendingRequest: false }
            : user,
        ),
      );

      // Clear request status
      setRequestStatus((prev) => {
        const newStatus = { ...prev };
        delete newStatus[data.declinedBy];
        return newStatus;
      });
    });

    // Cleanup
    return () => {
      socket.off("friendRequestAccepted");
      socket.off("friendRemoved");
      socket.off("friendRequestDeclined");
    };
  }, []);

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

  // Desktop version - self-contained button + modal
  if (!mobileOnly) {
    return (
      <>
        <button
          onClick={handleOpenModal}
          className="flex items-center space-x-2 rounded-md border border-white/30 bg-white/10 px-3 py-2 text-base text-white transition-colors hover:border-white/50 hover:bg-white/20"
        >
          <i className="fa-solid fa-magnifying-glass text-lg"></i>
          <span>Find Friends</span>
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[9998] bg-black/40"
              onClick={handleCloseModal}
            ></div>

            {/* Modal - Top positioned, horizontally centered */}
            <div className="fixed top-20 left-1/2 z-[9999] w-full max-w-2xl -translate-x-1/2 rounded-lg bg-white p-8 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  Find Friends
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 transition-colors hover:text-gray-600"
                >
                  <i className="fa-solid fa-times text-2xl"></i>
                </button>
              </div>

              {/* Search Input */}
              <div className="relative mb-6">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for friends by username..."
                  className="focus:border-cerulean w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-4 pl-12 text-base text-gray-900 placeholder-gray-400 focus:outline-none"
                  autoFocus
                />
                <i className="fa-solid fa-magnifying-glass absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"></i>
              </div>

              {/* Results Container - Scrollable */}
              <div className="max-h-96 min-h-[200px] overflow-y-auto">
                {/* Empty State */}
                {!searchTerm.trim() &&
                  !isLoading &&
                  searchResults.length === 0 && (
                    <div className="flex items-center justify-center py-16">
                      <p className="text-gray-400">
                        Start typing to search for friends...
                      </p>
                    </div>
                  )}
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
                  <div className="space-y-3">
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
          </>
        )}
      </>
    );
  }

  // Mobile version - controlled by parent
  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/40 xl:hidden"
        onClick={onClose}
      ></div>

      {/* Modal - Top positioned */}
      <div className="fixed top-20 left-1/2 z-[9999] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 rounded-lg bg-white p-6 shadow-xl xl:hidden">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Find Friends</h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for friends by username..."
            className="focus:border-cerulean w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 pl-12 text-base text-gray-900 placeholder-gray-400 focus:outline-none"
            autoFocus
          />
          <i className="fa-solid fa-magnifying-glass absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"></i>
        </div>

        {/* Results Container - Scrollable */}
        <div className="max-h-96 min-h-[200px] overflow-y-auto">
          {/* Empty State */}
          {!searchTerm.trim() && !isLoading && searchResults.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <p className="text-gray-400">
                Start typing to search for friends...
              </p>
            </div>
          )}
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
            <div className="space-y-3">
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
    </>
  );
};

export default SearchBar;
