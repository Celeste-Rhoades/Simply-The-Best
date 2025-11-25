import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import routes from "../routes";
import { usePendingRecommendations } from "../hooks/usePendingRecommendations";
import NavBar from "../shared-components/NavBar";

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
      className={`flex min-h-screen flex-col ${isDarkMode ? "bg-gray-900" : "bg-lightTanGray"}`}
    >
      <NavBar />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
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
            <div className="space-y-6">
              {pendingRecs.map((rec) => (
                <div
                  key={rec._id}
                  className="rounded-lg bg-white p-6 shadow-md"
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {rec.title}
                    </h3>
                    <p className="mt-2 text-gray-600">{rec.description}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      Category: {rec.category}
                    </div>
                  </div>

                  <div className="flex space-x-3">
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
                      className="flex items-center space-x-2 rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600 disabled:opacity-50"
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
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PendingRecommendations;
