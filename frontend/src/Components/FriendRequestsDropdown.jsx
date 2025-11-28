import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../contexts/NotificationContext";
import apiFetch from "../services/apiFetch";
import routes from "../routes";
import {
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
  Type as ListType,
} from "react-swipeable-list";
import "react-swipeable-list/dist/styles.css";

const FriendRequestsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [processing, setProcessing] = useState({});
  const navigate = useNavigate();

  // Get real-time data from NotificationContext
  const {
    pendingRequests,
    friendRequestCount,
    pendingRecommendationCount,
    acceptedNotifications,
    removeFriendRequest,
    markAcceptedAsRead,
    deleteAcceptedNotification,
    clearAllAcceptedNotifications,
    setPendingRecommendationCount,
  } = useNotifications();

  const handleAccept = async (userId) => {
    setProcessing((prev) => ({ ...prev, [userId]: "accepting" }));

    try {
      const res = await apiFetch(
        "POST",
        `/api/users/friendRequest/accept/${userId}`,
      );

      if (res.ok) {
        removeFriendRequest(userId);
        setProcessing((prev) => {
          const newState = { ...prev };
          delete newState[userId];
          return newState;
        });
        window.location.reload();
      } else {
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
    setProcessing((prev) => ({ ...prev, [userId]: "declining" }));

    try {
      const res = await apiFetch(
        "POST",
        `/api/users/friendRequest/decline/${userId}`,
      );

      if (res.ok) {
        removeFriendRequest(userId);
      }

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
        onClick={() => {
          setIsOpen(!isOpen);
          markAcceptedAsRead();
        }}
      >
        <i className="fa-solid fa-bell text-base sm:text-lg md:text-xl lg:text-xl"></i>
        {friendRequestCount + pendingRecommendationCount > 0 && (
          <span
            className="absolute -top-3 -right-3 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white sm:h-6 sm:w-6 sm:text-xs"
            style={{ backgroundColor: "var(--color-hotCoralPink)" }}
          >
            {friendRequestCount + pendingRecommendationCount > 9
              ? "9+"
              : friendRequestCount + pendingRecommendationCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-2 z-50 mt-2 max-h-[70vh] w-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg sm:right-0 sm:w-72 md:w-80 lg:w-96">
          <div className="border-b border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>

          <div>
            {/* SECTION 1: PENDING RECOMMENDATIONS */}
            {pendingRecommendationCount > 0 && (
              <div className="border-b border-gray-100">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setPendingRecommendationCount(0);
                    navigate(routes.pendingRecommendations);
                  }}
                  className="w-full p-4 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <i className="fa-solid fa-star text-laguna"></i>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {pendingRecommendationCount} Pending Recommendation
                          {pendingRecommendationCount !== 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-gray-500">Click to view</p>
                      </div>
                    </div>
                    <i className="fa-solid fa-chevron-right text-gray-400"></i>
                  </div>
                </button>
              </div>
            )}

            {/* SECTION 2: FRIEND REQUESTS */}
            {pendingRequests.length > 0 && (
              <div className="border-b border-gray-100 p-2">
                <p className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                  Friend Requests
                </p>

                <SwipeableList type={ListType.IOS}>
                  {pendingRequests.slice(0, 3).map((request) => (
                    <SwipeableListItem
                      key={request._id}
                      trailingActions={
                        <TrailingActions>
                          <SwipeAction
                            onClick={() => handleAccept(request._id)}
                          >
                            <div className="flex h-full items-center justify-center bg-green-500 px-4 text-white">
                              <div className="flex flex-col items-center">
                                <i className="fa-solid fa-check text-lg"></i>
                                <span className="mt-1 text-xs">Accept</span>
                              </div>
                            </div>
                          </SwipeAction>
                          <SwipeAction
                            onClick={() => handleDecline(request._id)}
                            destructive={true}
                          >
                            <div
                              className="flex h-full items-center justify-center px-4 text-white"
                              style={{
                                backgroundColor: "var(--color-hotCoralPink)",
                              }}
                            >
                              <div className="flex flex-col items-center">
                                <i className="fa-solid fa-times text-lg"></i>
                                <span className="mt-1 text-xs">Decline</span>
                              </div>
                            </div>
                          </SwipeAction>
                        </TrailingActions>
                      }
                    >
                      <div className="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                            <i className="fa-solid fa-user text-sm text-gray-600"></i>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {request.username}
                          </span>
                        </div>

                        {/* Desktop buttons - hidden on mobile/tablet */}
                        <div className="hidden space-x-2 lg:flex">
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
                            className="rounded px-3 py-1 text-xs text-white disabled:opacity-50"
                            style={{
                              backgroundColor: "var(--color-hotCoralPink)",
                            }}
                            onMouseEnter={(e) =>
                              (e.target.style.opacity = "0.9")
                            }
                            onMouseLeave={(e) => (e.target.style.opacity = "1")}
                          >
                            {processing[request._id] === "declining"
                              ? "Declining..."
                              : "Decline"}
                          </button>
                        </div>
                      </div>
                    </SwipeableListItem>
                  ))}
                </SwipeableList>
              </div>
            )}

            {/* SECTION 3: ACCEPTED NOTIFICATIONS */}
            {acceptedNotifications.length > 0 && (
              <div className="p-2">
                <div className="flex items-center justify-between px-2 py-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Recent Activity
                  </p>
                  <button
                    onClick={clearAllAcceptedNotifications}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Clear All
                  </button>
                </div>

                <SwipeableList type={ListType.IOS}>
                  {acceptedNotifications.map((notification) => (
                    <SwipeableListItem
                      key={notification.id}
                      trailingActions={
                        <TrailingActions>
                          <SwipeAction
                            onClick={() =>
                              deleteAcceptedNotification(notification.id)
                            }
                            destructive={true}
                          >
                            <div
                              className="flex h-full items-center justify-center px-6 text-white"
                              style={{
                                backgroundColor: "var(--color-hotCoralPink)",
                              }}
                            >
                              <i className="fa-solid fa-trash"></i>
                            </div>
                          </SwipeAction>
                        </TrailingActions>
                      }
                    >
                      <div
                        className={`group flex items-center justify-between rounded-lg p-3 hover:bg-gray-50 ${
                          notification.read ? "opacity-60" : ""
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                            <i className="fa-solid fa-check text-sm text-green-600"></i>
                          </div>
                          <p
                            className={`text-sm ${
                              notification.read
                                ? "font-normal text-gray-600"
                                : "font-semibold text-gray-900"
                            }`}
                          >
                            {notification.username} accepted your friend request
                          </p>
                        </div>

                        {/* Desktop delete button - hidden on mobile/tablet */}
                        <button
                          onClick={() =>
                            deleteAcceptedNotification(notification.id)
                          }
                          className="hidden text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-600 lg:block"
                          aria-label="Delete notification"
                        >
                          <i className="fa-solid fa-times"></i>
                        </button>
                      </div>
                    </SwipeableListItem>
                  ))}
                </SwipeableList>
              </div>
            )}

            {/* Empty State */}
            {pendingRecommendationCount === 0 &&
              pendingRequests.length === 0 &&
              acceptedNotifications.length === 0 && (
                <div className="p-8 text-center text-gray-600">
                  <i className="fa-solid fa-bell-slash mb-2 text-4xl text-gray-300"></i>
                  <p>No notifications</p>
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
