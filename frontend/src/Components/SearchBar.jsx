import { useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
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

  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm(""); // Clear search when closing
  };

  return (
    <>
      {/* Compact Button - Icon + Text */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 text-white transition-colors hover:text-gray-200"
        aria-label="Find friends"
      >
        <i className="fa-solid fa-magnifying-glass text-lg"></i>
        <span className="text-base font-medium">Find Friends</span>
      </button>

      {/* Search Modal */}
      <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-start justify-center p-4 pt-20">
          <DialogPanel className="mx-auto w-full max-w-2xl rounded-lg bg-white shadow-xl">
            {/* Modal Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Find Friends
                </h2>
                <button
                  onClick={handleClose}
                  className="text-gray-400 transition-colors hover:text-gray-600"
                >
                  <i className="fa-solid fa-xmark text-2xl"></i>
                </button>
              </div>

              {/* Search Input */}
              <div className="relative mt-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for friends by username..."
                  autoFocus
                  className="focus:border-cerulean w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pl-12 text-gray-900 placeholder-gray-500 focus:outline-none"
                />
                <i className="fa-solid fa-magnifying-glass absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto p-6">
              {isLoading && (
                <div className="py-8 text-center text-gray-600">
                  Searching...
                </div>
              )}

              {searchError && (
                <div className="py-8 text-center text-red-600">
                  {searchError}
                </div>
              )}

              {searchResults.length === 0 &&
                !isLoading &&
                !searchError &&
                searchTerm.length > 1 && (
                  <div className="py-8 text-center text-gray-600">
                    No users found
                  </div>
                )}

              {searchResults.length === 0 &&
                !isLoading &&
                !searchError &&
                searchTerm.length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    Start typing to search for friends...
                  </div>
                )}

              {searchResults.length > 0 && (
                <div className="space-y-3">
                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                          <span className="text-lg font-semibold text-gray-700">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {user.username}
                        </span>
                      </div>

                      {/* Conditional button based on friendship status */}
                      {user.isFriend ? (
                        <span className="rounded bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
                          Friends
                        </span>
                      ) : user.isPendingRequest ||
                        requestStatus[user._id] === "sent" ? (
                        <span className="rounded bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-700">
                          Request Sent
                        </span>
                      ) : (
                        <button
                          onClick={() => sendFriendRequest(user._id)}
                          disabled={
                            requestStatus[user._id] === "loading" ||
                            requestStatus[user._id] === "sent"
                          }
                          className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                            requestStatus[user._id] === "loading"
                              ? "cursor-not-allowed bg-gray-400 text-white"
                              : requestStatus[user._id] === "sent"
                                ? "cursor-not-allowed bg-green-500 text-white"
                                : "bg-hotCoralPink text-white hover:bg-pink-600"
                          }`}
                        >
                          {requestStatus[user._id] === "loading" ? (
                            <>
                              <i className="fa-solid fa-spinner mr-2 animate-spin"></i>
                              Sending...
                            </>
                          ) : requestStatus[user._id] === "sent" ? (
                            "Sent"
                          ) : (
                            "Add Friend"
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default SearchBar;
