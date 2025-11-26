import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../contexts/NotificationContext";
import apiFetch from "../services/apiFetch";
import routes from "../routes";

const FriendRequestsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [processing, setProcessing] = useState({});
  const navigate = useNavigate();

  // Get real-time data from NotificationContext
  const { pendingRequests, friendRequestCount, removeFriendRequest } =
    useNotifications();

  const handleViewAll = () => {
    setIsOpen(false);
    navigate(routes.friendRequests);
  };

  const handleAccept = async (userId) => {
    // Set processing state
    setProcessing((prev) => ({ ...prev, [userId]: "accepting" }));

    try {
      const res = await apiFetch(
        "POST",
        `/api/users/friendRequest/accept/${userId}`,
      );

      if (res.ok) {
        // Remove from list immediately
        removeFriendRequest(userId);

        // Clear processing state
        setProcessing((prev) => {
          const newState = { ...prev };
          delete newState[userId];
          return newState;
        });

        // Reload to show new friend's recommendations
        window.location.reload();
      } else {
        // Clear processing on error
        setProcessing((prev) => {
          const newState = { ...prev };
          delete newState[userId];
          return newState;
        });
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      setProcessing((prev) => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    }
  };

  const handleDecline = async (userId) => {
    // Set processing state
    setProcessing((prev) => ({ ...prev, [userId]: "declining" }));

    try {
      const res = await apiFetch(
        "POST",
        `/api/users/friendRequest/decline/${userId}`,
      );

      if (res.ok) {
        // Remove from list immediately
        removeFriendRequest(userId);
      }

      // Clear processing state
      setProcessing((prev) => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    } catch (error) {
      console.error("Error declining request:", error);
      setProcessing((prev) => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        type="button"
        className="relative text-white hover:text-gray-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="fa-solid fa-bell text-base sm:text-lg md:text-xl lg:text-xl"></i>
        {friendRequestCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white sm:h-5 sm:w-5 sm:text-xs">
            {friendRequestCount > 9 ? "9+" : friendRequestCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 z-50 mt-2 w-96 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900">Friend Requests</h3>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {pendingRequests.length === 0 ? (
              <div className="p-4 text-center text-gray-600">
                No pending friend requests
              </div>
            ) : (
              <div className="p-2">
                {pendingRequests.slice(0, 3).map((request) => (
                  <div
                    key={request._id}
                    className="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                        <i className="fa-solid fa-user text-sm text-gray-600"></i>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {request.username}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAccept(request._id)}
                        disabled={processing[request._id]}
                        className="rounded bg-green-500 px-3 py-1 text-xs text-white hover:bg-green-600 disabled:opacity-50"
                      >
                        {processing[request._id] === "accepting"
                          ? "Accepting..."
                          : "Accept"}
                      </button>
                      <button
                        onClick={() => handleDecline(request._id)}
                        disabled={processing[request._id]}
                        className="rounded bg-gray-500 px-3 py-1 text-xs text-white hover:bg-gray-600 disabled:opacity-50"
                      >
                        {processing[request._id] === "declining"
                          ? "Declining..."
                          : "Decline"}
                      </button>
                    </div>
                  </div>
                ))}

                {pendingRequests.length > 3 && (
                  <div className="border-t border-gray-100 p-3">
                    <button
                      onClick={handleViewAll}
                      className="text-cerulean w-full text-center text-sm hover:text-blue-600"
                    >
                      View all {pendingRequests.length} requests
                    </button>
                  </div>
                )}
              </div>
            )}
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

export default FriendRequestsDropdown;
