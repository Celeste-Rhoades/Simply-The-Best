import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFriendRequests } from "../hooks/userFriendRequests.js";
import routes from "../routes";

const FriendRequestsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { pendingCount } = useFriendRequests();
  const navigate = useNavigate();

  const handleViewAll = () => {
    setIsOpen(false);
    navigate(routes.friendRequests);
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        type="button"
        className="relative p-2 text-white hover:text-gray-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="fa-solid fa-bell text-xl"></i>
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {pendingCount > 9 ? "9+" : pendingCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900">Friend Requests</h3>
          </div>

          <div className="p-4">
            {pendingCount === 0 ? (
              <p className="py-4 text-center text-gray-600">
                No pending friend requests
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  You have {pendingCount} pending friend request
                  {pendingCount !== 1 ? "s" : ""}
                </p>
                <button
                  onClick={handleViewAll}
                  className="bg-cerulean w-full rounded-lg px-4 py-2 text-white hover:bg-blue-600"
                >
                  View All Requests
                </button>
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
