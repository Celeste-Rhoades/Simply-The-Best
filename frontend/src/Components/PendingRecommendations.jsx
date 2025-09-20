import { useState, useEffect } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { useNavigate } from "react-router-dom";

import NavBar from "shared-components/NavBar";
import AcceptRecommendationModal from "./AcceptRecommendationModal";
import apiFetch from "../services/apiFetch";
import routes from "../routes";

const PendingRecommendations = () => {
  const [pendingRecs, setPendingRecs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingActions, setProcessingActions] = useState({});
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [actionSuccess, setActionSuccess] = useState("");

  const navigate = useNavigate();

  const fetchPendingRecommendations = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await apiFetch("GET", "/api/recommendations/pending");
      if (res.ok) {
        const data = await res.json();
        setPendingRecs(data.data);
      } else {
        setError("Failed to fetch pending recommendations");
      }
    } catch (err) {
      setError("Network error");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRecommendations();
  }, []);

  const handleAcceptClick = (recommendation) => {
    setSelectedRecommendation(recommendation);
    setShowAcceptModal(true);
  };

  const handleAcceptSubmit = async (id, updatedData) => {
    setProcessingActions((prev) => ({ ...prev, [id]: "approving" }));

    try {
      const res = await apiFetch(
        "POST",
        `/api/recommendations/approve/${id}`,
        updatedData,
      );
      if (res.ok) {
        // Remove from pending list
        const updatedPendingRecs = pendingRecs.filter((rec) => rec._id !== id);
        setPendingRecs(updatedPendingRecs);

        setActionSuccess("Recommendation accepted and added to your list!");
        setTimeout(() => setActionSuccess(""), 3000);
        setShowAcceptModal(false);

        // Check if no more pending recommendations
        if (updatedPendingRecs.length === 0) {
          setTimeout(() => {
            navigate(routes.myRecommendations);
          }, 2000); // Wait 2 seconds to show success message
        }

        return { success: true };
      } else {
        const errorData = await res.json();
        return { success: false, error: errorData.message };
      }
    } catch (error) {
      return { success: false, error: "Network error" };
    } finally {
      setProcessingActions((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  const handleRejectClick = async (recommendation) => {
    if (confirm(`Are you sure you want to reject "${recommendation.title}"?`)) {
      setProcessingActions((prev) => ({
        ...prev,
        [recommendation._id]: "rejecting",
      }));

      try {
        const res = await apiFetch(
          "POST",
          `/api/recommendations/reject/${recommendation._id}`,
        );
        if (res.ok) {
          // Remove from pending list
          const updatedPendingRecs = pendingRecs.filter(
            (rec) => rec._id !== recommendation._id,
          );
          setPendingRecs(updatedPendingRecs);

          setActionSuccess("Recommendation rejected");
          setTimeout(() => setActionSuccess(""), 3000);

          // Check if no more pending recommendations
          if (updatedPendingRecs.length === 0) {
            setTimeout(() => {
              navigate(routes.myRecommendations);
            }, 2000); // Wait 2 seconds to show success message
          }
        } else {
          setError("Failed to reject recommendation");
        }
      } catch (error) {
        setError("Network error");
        console.error(error);
      } finally {
        setProcessingActions((prev) => {
          const newState = { ...prev };
          delete newState[recommendation._id];
          return newState;
        });
      }
    }
  };

  const toTitleCase = (str) => {
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
    );
  };

  return (
    <div className="bg-lightTanGray relative min-h-screen w-full">
      <NavBar />

      <div className="mx-8 mt-8">
        <h1 className="font-boldRaleway mb-6 text-3xl">
          Pending Recommendations
        </h1>

        {actionSuccess && (
          <div className="mb-4 rounded bg-green-100 p-3 text-green-700">
            {actionSuccess}
          </div>
        )}

        {isLoading ? (
          <div className="font-manrope flex items-center justify-center py-12">
            <p className="text-lg text-gray-600">
              Loading pending recommendations...
            </p>
          </div>
        ) : error ? (
          <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            <p className="mb-2">{error}</p>
            <button
              onClick={fetchPendingRecommendations}
              className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        ) : pendingRecs.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mb-4">
              <i className="fa-solid fa-check-circle mb-4 text-6xl text-green-500"></i>
            </div>
            <p className="font-raleway mb-2 text-xl text-gray-700">
              All caught up!
            </p>
            <p className="font-raleway mb-4 text-lg text-gray-600">
              No more pending recommendations.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to My Recommendations...
            </p>
          </div>
        ) : (
          <div className="font-raleway">
            <div className="bg-cerulean flex flex-wrap gap-4 rounded-xl p-4 shadow">
              {pendingRecs.map((recommendation) => (
                <div key={recommendation._id} className="w-60 flex-shrink-0">
                  <div className="font flex h-60 w-60 flex-col overflow-hidden rounded-lg bg-white shadow-lg">
                    {/* Header section with title and stars */}
                    <div className="bg-lightTanGray p-3 text-center">
                      <h3 className="font-boldManrope mb-2 line-clamp-2 text-sm font-bold">
                        {toTitleCase(recommendation.title)}
                      </h3>
                      <div className="flex justify-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={
                              star <= recommendation.rating
                                ? "text-lighTeal text-lg"
                                : "text-lg text-gray-300"
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Description section */}
                    <div className="m-2 flex flex-grow items-center justify-center bg-gray-800 p-3 text-white">
                      <p className="line-clamp-4 text-center text-sm">
                        {recommendation.description || "Description"}
                      </p>
                    </div>

                    {/* Footer section with accept/reject buttons */}
                    <div className="bg-lightTanGray flex items-center justify-between p-2">
                      {/* Reject button - left */}
                      <button
                        onClick={() => handleRejectClick(recommendation)}
                        disabled={processingActions[recommendation._id]}
                        className="text-red-500 transition-colors hover:text-red-600 disabled:opacity-50"
                        aria-label="Reject recommendation"
                      >
                        {processingActions[recommendation._id] ===
                        "rejecting" ? (
                          <i className="fa-solid fa-spinner animate-spin text-lg"></i>
                        ) : (
                          <i className="fa-solid fa-times text-lg"></i>
                        )}
                      </button>

                      {/* Recommender info - center */}
                      <span className="text-xs text-gray-600">
                        By {recommendation.user?.username}
                      </span>

                      {/* Accept button - right */}
                      <button
                        onClick={() => handleAcceptClick(recommendation)}
                        disabled={processingActions[recommendation._id]}
                        className="text-green-500 transition-colors hover:text-green-600 disabled:opacity-50"
                        aria-label="Accept recommendation"
                      >
                        {processingActions[recommendation._id] ===
                        "approving" ? (
                          <i className="fa-solid fa-spinner animate-spin text-lg"></i>
                        ) : (
                          <i className="fa-solid fa-check text-lg"></i>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Accept Modal */}
      <AcceptRecommendationModal
        isOpen={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        recommendation={selectedRecommendation}
        onAccept={handleAcceptSubmit}
      />
    </div>
  );
};

export default PendingRecommendations;
