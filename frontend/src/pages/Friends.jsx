import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import NavBar from "shared-components/NavBar";
import SearchBar from "../shared-components/SearchBar";
import apiFetch from "../services/apiFetch";
import socket from "../services/socket";
import {
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
  Type as ListType,
} from "react-swipeable-list";
import "react-swipeable-list/dist/styles.css";

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState({});
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const { isDarkMode } = useTheme();

  // Fetch friends list
  const fetchFriends = async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await apiFetch("GET", "/api/users/friends");

      if (res.ok) {
        const data = await res.json();
        setFriends(data.data || []);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to load friends");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Error fetching friends:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete/Remove friend
  const handleRemoveFriend = async (friendId, friendUsername) => {
    if (
      !confirm(
        `Are you sure you want to remove ${friendUsername} from your friends?`,
      )
    ) {
      return;
    }

    setProcessing((prev) => ({ ...prev, [friendId]: true }));
    setError("");

    try {
      const res = await apiFetch("DELETE", `/api/users/friends/${friendId}`);

      if (res.ok) {
        // Remove from list
        setFriends((prev) => prev.filter((friend) => friend._id !== friendId));

        // Show success message
        setDeleteSuccess(
          `${friendUsername} has been removed from your friends`,
        );
        setTimeout(() => setDeleteSuccess(""), 3000);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to remove friend");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Error removing friend:", err);
    } finally {
      setProcessing((prev) => {
        const newState = { ...prev };
        delete newState[friendId];
        return newState;
      });
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchFriends();
  }, []);

  // Socket listeners for real-time updates
  useEffect(() => {
    console.log("🔔 Friends page socket listeners registered");

    // When someone accepts your friend request
    socket.on("friendRequestAccepted", (data) => {
      console.log(
        "Friend request accepted - adding to friends list:",
        data.acceptorUsername,
      );

      // Add new friend to the list
      setFriends((prev) => [
        ...prev,
        { _id: data.acceptorId, username: data.acceptorUsername },
      ]);

      // Show success message
      setDeleteSuccess(`${data.acceptorUsername} is now your friend!`);
      setTimeout(() => setDeleteSuccess(""), 3000);
    });

    // When someone removes you as a friend
    socket.on("friendRemoved", (data) => {
      console.log("Friend removed you:", data);

      // Remove from friends list
      setFriends((prev) =>
        prev.filter((friend) => friend._id !== data.removedBy),
      );
    });

    // Cleanup
    return () => {
      socket.off("friendRequestAccepted");
      socket.off("friendRemoved");
    };
  }, []);

  return (
    <div
      className={`relative min-h-screen w-full ${isDarkMode ? "bg-gray-700" : "bg-lightTanGray"}`}
    >
      <NavBar />

      <div className="mx-4 mt-8 sm:mx-8">
        <div className="mb-6 flex items-center justify-between">
          <h1
            className={`font-boldRaleway text-3xl ${isDarkMode ? "text-white" : "text-darkBlue"}`}
          >
            My Friends
          </h1>
          <button
            onClick={() => setShowSearchModal(true)}
            className="font-body bg-cerulean rounded-md px-4 py-2 text-white shadow-lg transition-colors hover:bg-[#0799ba]"
          >
            <i
              className="fa-solid fa-magnifying-glass mr-2"
              aria-hidden="true"
            ></i>
            <span className="hidden sm:inline">Find Friends</span>
            <span className="sm:hidden">Find</span>
          </button>
        </div>

        {/* Success Message */}
        {deleteSuccess && (
          <div className="mb-4 rounded bg-green-100 p-3 text-green-700">
            {deleteSuccess}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            <p className="mb-2">{error}</p>
            <button
              onClick={fetchFriends}
              className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p
              className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Loading friends...
            </p>
          </div>
        ) : friends.length === 0 ? (
          // Empty State
          <div className="py-12 text-center">
            <div className="mb-4">
              <i
                className={`fa-solid fa-user-group mb-4 text-6xl ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
              ></i>
            </div>
            <p
              className={`font-raleway mb-2 text-xl ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
            >
              No friends yet
            </p>
            <p
              className={`font-raleway ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Start adding friends to see their recommendations!
            </p>
          </div>
        ) : (
          // Friends List - Centered grid layout with swipeable items
          <div className="mx-auto max-w-5xl">
            <SwipeableList type={ListType.ANDROID}>
              <div className="grid grid-cols-1 justify-items-center gap-3 md:grid-cols-2 lg:grid-cols-3">
                {friends.map((friend) => (
                  <SwipeableListItem
                    key={friend._id}
                    trailingActions={
                      <TrailingActions>
                        <SwipeAction
                          onClick={() =>
                            handleRemoveFriend(friend._id, friend.username)
                          }
                          destructive={true}
                        >
                          <div
                            className="flex h-full items-center justify-center px-6 text-white"
                            style={{
                              backgroundColor: "var(--color-hotCoralPink)",
                            }}
                          >
                            <div className="flex flex-col items-center">
                              <i className="fa-solid fa-trash text-lg"></i>
                              <span className="mt-1 text-xs">Remove</span>
                            </div>
                          </div>
                        </SwipeAction>
                      </TrailingActions>
                    }
                  >
                    <div className="flex w-full items-center justify-between rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-md">
                      <div className="flex items-center gap-3">
                        {/* Avatar Circle */}
                        <div className="bg-cerulean flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-white">
                          <span className="text-xl font-bold">
                            {friend.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        {/* Username */}
                        <div className="min-w-0 flex-1">
                          <p className="font-raleway text-darkBlue truncate text-lg font-semibold">
                            {friend.username?.charAt(0).toUpperCase() +
                              friend.username?.slice(1)}
                          </p>
                          <p className="text-sm text-gray-500">Friend</p>
                        </div>
                      </div>

                      {/* Remove Button - Desktop only, always visible */}
                      <button
                        onClick={() =>
                          handleRemoveFriend(friend._id, friend.username)
                        }
                        disabled={processing[friend._id]}
                        className="bg-lightOrange hover:bg-hotCoralPink hidden flex-shrink-0 rounded px-3 py-1.5 text-sm text-white transition-colors disabled:opacity-50 lg:block"
                        aria-label="Remove friend"
                      >
                        {processing[friend._id] ? (
                          <i className="fa-solid fa-spinner animate-spin"></i>
                        ) : (
                          "Remove"
                        )}
                      </button>
                    </div>
                  </SwipeableListItem>
                ))}
              </div>
            </SwipeableList>
          </div>
        )}

        {/* Friends Count */}
        {!isLoading && friends.length > 0 && (
          <div className="mt-6 text-center">
            <p
              className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              You have {friends.length}{" "}
              {friends.length === 1 ? "friend" : "friends"}
            </p>
          </div>
        )}
      </div>

      {/* Search modal */}
      <SearchBar
        isVisible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        externalControl={true}
      />
    </div>
  );
};

export default Friends;
