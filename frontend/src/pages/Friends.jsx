import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import NavBar from "shared-components/NavBar";
import apiFetch from "../services/apiFetch";
import socket from "../services/socket";

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState({});
  const [deleteSuccess, setDeleteSuccess] = useState("");
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
        <h1
          className={`font-boldRaleway mb-6 text-3xl ${isDarkMode ? "text-white" : "text-darkBlue"}`}
        >
          My Friends
        </h1>

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
          // Friends List
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {friends.map((friend) => (
              <div
                key={friend._id}
                className="flex items-center justify-between rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar Circle */}
                  <div className="bg-cerulean flex h-12 w-12 items-center justify-center rounded-full text-white">
                    <span className="text-xl font-bold">
                      {friend.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Username */}
                  <div>
                    <p className="font-raleway text-darkBlue text-lg font-semibold">
                      {friend.username?.charAt(0).toUpperCase() +
                        friend.username?.slice(1)}
                    </p>
                    <p className="text-sm text-gray-500">Friend</p>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() =>
                    handleRemoveFriend(friend._id, friend.username)
                  }
                  disabled={processing[friend._id]}
                  className="bg-lightOrange hover:bg-hotCoralPink rounded px-3 py-1.5 text-sm text-white transition-colors disabled:opacity-50"
                  aria-label="Remove friend"
                >
                  {processing[friend._id] ? (
                    <i className="fa-solid fa-spinner animate-spin"></i>
                  ) : (
                    "Remove"
                  )}
                </button>
              </div>
            ))}
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
    </div>
  );
};

export default Friends;
