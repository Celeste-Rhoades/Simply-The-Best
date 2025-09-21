import { useState } from "react";
import { useUserSearch } from "../hooks/userUserSearch";

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    isLoading,
    searchError,
    requestStatus,
    sendFriendRequest,
  } = useUserSearch();

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search users..."
          className="focus:border-cerulean w-64 rounded-lg border border-gray-300 bg-white px-4 py-2 pr-10 text-gray-900 focus:outline-none"
        />
        <i className="fa-solid fa-magnifying-glass absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"></i>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (searchTerm.length > 0 || searchResults.length > 0) && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="max-h-64 overflow-y-auto">
            {isLoading && (
              <div className="p-4 text-center text-gray-600">Searching...</div>
            )}

            {searchError && (
              <div className="p-4 text-center text-red-600">{searchError}</div>
            )}

            {searchResults.length === 0 &&
              !isLoading &&
              !searchError &&
              searchTerm.length > 1 && (
                <div className="p-4 text-center text-gray-600">
                  No users found
                </div>
              )}

            {searchResults.map((user) => (
              <div
                key={user._id}
                className="border-b border-gray-100 p-4 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {user.username}
                  </span>

                  {/* Conditional button based on friendship status */}
                  {user.isFriend ? (
                    <span className="rounded bg-green-100 px-3 py-1 text-sm font-medium text-green-600">
                      Friends
                    </span>
                  ) : user.isPendingRequest ? (
                    <span className="rounded bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-600">
                      Request Sent
                    </span>
                  ) : (
                    <button
                      onClick={() => sendFriendRequest(user._id)}
                      disabled={
                        requestStatus[user._id] === "loading" ||
                        requestStatus[user._id] === "sent"
                      }
                      className={`rounded px-3 py-1 text-sm font-medium ${
                        requestStatus[user._id] === "loading"
                          ? "cursor-not-allowed bg-gray-400 text-white"
                          : requestStatus[user._id] === "sent"
                            ? "cursor-not-allowed bg-green-500 text-white"
                            : "bg-hotCoralPink text-white hover:bg-pink-600"
                      }`}
                    >
                      {requestStatus[user._id] === "loading"
                        ? "Sending..."
                        : requestStatus[user._id] === "sent"
                          ? "Sent"
                          : "Add"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default SearchBar;
