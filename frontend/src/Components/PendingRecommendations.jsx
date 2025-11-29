import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useNotifications } from "../contexts/NotificationContext";
import routes from "../routes";
import { usePendingRecommendations } from "../hooks/usePendingRecommendations";
import NavBar from "../shared-components/NavBar";
import {
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
  Type as ListType,
} from "react-swipeable-list";
import "react-swipeable-list/dist/styles.css";

const PendingRecommendations = () => {
  const navigate = useNavigate();
  const {
    pendingRecs,
    isLoading,
    approveRecommendation,
    rejectRecommendation,
  } = usePendingRecommendations();

  const [processingId, setProcessingId] = useState(null);
  const { isDarkMode } = useTheme();
  const { setPendingRecommendationCount } = useNotifications();

  // Clear notification badge when viewing pending recommendations
  useEffect(() => {
    setPendingRecommendationCount(0);
  }, [setPendingRecommendationCount]);

  // Redirect when no pending recommendations
  useEffect(() => {
    if (!isLoading && pendingRecs && pendingRecs.length === 0) {
      const timer = setTimeout(() => {
        navigate(routes.myRecommendations);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [isLoading, pendingRecs, navigate]);

  const handleAccept = async (recId) => {
    setProcessingId(recId);
    await approveRecommendation(recId);
    setProcessingId(null);
  };

  const handleReject = async (recId) => {
    setProcessingId(recId);
    await rejectRecommendation(recId);
    setProcessingId(null);
  };

  return (
    <div
      className={`flex min-h-screen flex-col ${isDarkMode ? "bg-gray-700" : "bg-lightTanGray"}`}
    >
      <NavBar />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h1
            className={`mb-6 text-3xl font-bold ${isDarkMode ? "text-white" : "text-darkBlue"}`}
          >
            Pending Recommendations
          </h1>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <i className="fa-solid fa-spinner text-laguna animate-spin text-3xl"></i>
            </div>
          ) : !pendingRecs || pendingRecs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
                <i className="fa-solid fa-check text-3xl text-white"></i>
              </div>
              <h2
                className={`mb-2 text-2xl font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}
              >
                All caught up!
              </h2>
              <p
                className={`mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
              >
                No more pending recommendations.
              </p>
              <p
                className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                Redirecting to My Recommendations...
              </p>
            </div>
          ) : (
            <SwipeableList type={ListType.IOS} className="space-y-4">
              {pendingRecs.map((rec) => (
                <SwipeableListItem
                  key={rec._id}
                  trailingActions={
                    <TrailingActions>
                      <SwipeAction onClick={() => handleAccept(rec._id)}>
                        <div className="flex h-full items-center justify-center bg-green-500 px-6 text-white">
                          <div className="flex flex-col items-center">
                            <i className="fa-solid fa-check text-xl"></i>
                            <span className="mt-1 text-xs font-semibold">
                              Accept
                            </span>
                          </div>
                        </div>
                      </SwipeAction>
                      <SwipeAction onClick={() => handleReject(rec._id)}>
                        <div
                          className="flex h-full items-center justify-center px-6 text-white"
                          style={{
                            backgroundColor: "var(--color-hotCoralPink)",
                          }}
                        >
                          <div className="flex flex-col items-center">
                            <i className="fa-solid fa-times text-xl"></i>
                            <span className="mt-1 text-xs font-semibold">
                              Reject
                            </span>
                          </div>
                        </div>
                      </SwipeAction>
                    </TrailingActions>
                  }
                >
                  <div className="w-full rounded-lg bg-white p-6 shadow-md">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {rec.title}
                      </h3>
                      <p className="mt-2 text-gray-600">{rec.description}</p>
                      <div className="mt-2 text-sm text-gray-500">
                        Category: {rec.category}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        Recommended by: {rec.user?.username || "Unknown"}
                      </div>
                    </div>

                    {/* Desktop buttons - hidden on mobile/tablet */}
                    <div className="hidden space-x-3 lg:flex">
                      <button
                        onClick={() => handleAccept(rec._id)}
                        disabled={processingId === rec._id}
                        className="flex items-center space-x-2 rounded bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600 disabled:opacity-50"
                      >
                        {processingId === rec._id ? (
                          <i className="fa-solid fa-spinner animate-spin"></i>
                        ) : (
                          <i className="fa-solid fa-check"></i>
                        )}
                        <span>Accept</span>
                      </button>

                      <button
                        onClick={() => handleReject(rec._id)}
                        disabled={processingId === rec._id}
                        className="flex items-center space-x-2 rounded px-4 py-2 text-white transition-colors disabled:opacity-50"
                        style={{
                          backgroundColor: "var(--color-hotCoralPink)",
                        }}
                        onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
                        onMouseLeave={(e) => (e.target.style.opacity = "1")}
                      >
                        {processingId === rec._id ? (
                          <i className="fa-solid fa-spinner animate-spin"></i>
                        ) : (
                          <i className="fa-solid fa-times"></i>
                        )}
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </SwipeableListItem>
              ))}
            </SwipeableList>
          )}
        </div>
      </main>
    </div>
  );
};

export default PendingRecommendations;
