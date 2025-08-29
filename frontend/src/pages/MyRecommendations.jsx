import { useState, useEffect } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { useNavigate } from "react-router-dom";

import apiFetch from "services/apiFetch";
import NavBar from "shared-components/NavBar";
import RecommendAddModal from "./RecommendAddModal";
import RecommendToFriendModal from "../Components/RecommendFriendModal";
import CreateAndShareModal from "../pages/CreateAndShareModal";
import { useFriendRecommendations } from "../hooks/useFriendRecommendations";
import routes from "../routes";

const MyRecommendations = () => {
  const [showForm, setShowForm] = useState(false);
  const [showRec, setShowRec] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState("");
  const [carouselIndex, setCarouselIndex] = useState({});
  const [pendingCount, setPendingCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Share existing recommendation states
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [recommendSuccess, setRecommendSuccess] = useState("");

  // Create and share new recommendation states
  const [showCreateShareModal, setShowCreateShareModal] = useState(false);
  const [createShareSuccess, setCreateShareSuccess] = useState("");

  const { recommendToFriend } = useFriendRecommendations();
  const navigate = useNavigate();

  const fetchGroupRecs = async () => {
    setIsLoading(true);
    setErrors("");
    try {
      const res = await apiFetch("GET", "/api/recommendations/grouped");
      if (res.ok) {
        const data = await res.json();
        setShowRec(data.data);
      } else {
        setErrors("Failed to fetch recommendations.");
      }
    } catch {
      setErrors("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await apiFetch("GET", "/api/auth/myProfile");
      if (res.ok) {
        const data = await res.json();
        setCurrentUserId(data._id);
      }
    } catch (error) {
      console.log("Error fetching current user:", error);
    }
  };

  const handleDeleteRecommendation = async (recommendationId) => {
    try {
      const res = await apiFetch(
        "DELETE",
        `/api/recommendations/${recommendationId}`,
      );
      if (res.ok) {
        fetchGroupRecs(); // Refresh the recommendations
      } else {
        setErrors("Failed to delete recommendation.");
      }
    } catch (error) {
      console.error("Error deleting recommendation:", error);
      setErrors("Network error. Please try again.");
    }
  };

  const handleModalClose = () => {
    setShowForm(false);
    fetchGroupRecs();
    fetchPendingCount();
  };

  // Share existing recommendation functions
  const handleRecommendClick = (recommendation) => {
    setSelectedRecommendation(recommendation);
    setShowRecommendModal(true);
  };

  const handleRecommendSubmit = async (friendId, recommendationData) => {
    const result = await recommendToFriend(friendId, recommendationData);
    if (result.success) {
      setRecommendSuccess("Recommendation sent to your friend!");
      setTimeout(() => setRecommendSuccess(""), 3000);
      setShowRecommendModal(false);
    }
    return result;
  };

  // Create and share new recommendation function
  const handleCreateAndShare = async (friendId, recommendationData) => {
    const result = await recommendToFriend(friendId, recommendationData);
    if (result.success) {
      setCreateShareSuccess(
        "New recommendation created and shared with your friend!",
      );
      setTimeout(() => setCreateShareSuccess(""), 3000);
      setShowCreateShareModal(false);
    }
    return result;
  };

  useEffect(() => {
    fetchGroupRecs();
    fetchPendingCount();
    fetchCurrentUser();
  }, []);

  const updateCarouselIndex = (category, newIdx) => {
    setCarouselIndex((prev) => ({
      ...prev,
      [category]: newIdx,
    }));
  };

  const toTitleCase = (str) => {
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
    );
  };

  const fetchPendingCount = async () => {
    try {
      const res = await apiFetch("GET", "/api/recommendations/pending");
      if (res.ok) {
        const data = await res.json();
        setPendingCount(data.data.length);
      }
    } catch (error) {
      console.log("Error fetching pending count:", error);
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      <NavBar />

      {/* Success Messages */}
      {recommendSuccess && (
        <div className="mx-8 mt-4 rounded bg-green-100 p-3 text-green-700">
          {recommendSuccess}
        </div>
      )}
      {createShareSuccess && (
        <div className="mx-8 mt-4 rounded bg-green-100 p-3 text-green-700">
          {createShareSuccess}
        </div>
      )}

      <div className="mx-8 mt-4 flex justify-end">
        <button
          className="bg-coral font-raleway hover:bg-hotCoralPink mx-4 rounded-md px-4 py-2 text-white shadow-lg transition-colors"
          onClick={() => setShowForm(true)}
        >
          Add recommendation
        </button>

        {/* New Create & Share button */}
        <button
          className="font-raleway bg-tangerine hover:bg-brightSalmon mx-4 rounded-md px-4 py-2 text-white shadow-lg transition-colors"
          onClick={() => setShowCreateShareModal(true)}
        >
          Recommend to Friends
        </button>

        <button
          onClick={() => navigate(routes.pendingRecommendations)}
          className="bg-summerTeal hover:bg-lighTeal mr-2 rounded px-4 py-2 text-white transition-colors"
        >
          Pending ({pendingCount})
        </button>

        <Dialog
          open={showForm}
          onClose={() => setShowForm(false)}
          transition
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition duration-300 data-closed:opacity-0"
        >
          <DialogPanel
            transition
            className="w-full max-w-md transition duration-300 data-closed:scale-75 data-closed:opacity-0"
          >
            <RecommendAddModal onClose={handleModalClose} />
          </DialogPanel>
        </Dialog>
      </div>

      <div className="mx-8 mt-8">
        {isLoading ? (
          <div className="font-manrope flex items-center justify-center py-12">
            <p className="text-lg text-gray-600">Loading recommendations...</p>
          </div>
        ) : errors ? (
          <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            <p className="mb-2">{errors}</p>
            <button
              onClick={fetchGroupRecs}
              className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        ) : Object.keys(showRec).length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-rale text-lg text-gray-600">
              No recommendations yet. Add your first one!
            </p>
          </div>
        ) : (
          <div className="font-raleway">
            {Object.keys(showRec)
              .sort((a, b) => {
                // Put "better than all the rest" first
                if (a === "better than all the rest") return -1;
                if (b === "better than all the rest") return 1;

                // Then sort alphabetically
                return a.localeCompare(b);
              })
              .map((category) => (
                <div key={category} className="mb-8">
                  <h2 className="font-boldRaleway mb-4 pb-4 text-2xl">
                    {toTitleCase(category)}
                  </h2>
                  <div className="relative flex items-center">
                    {/* Left arrow  */}
                    <button
                      className="z-10 mr-4 p-2"
                      onClick={() =>
                        updateCarouselIndex(
                          category,
                          Math.max((carouselIndex[category] || 0) - 1, 0),
                        )
                      }
                      disabled={(carouselIndex[category] || 0) === 0}
                      aria-label="Previous"
                    >
                      <i className="fa-solid fa-circle-chevron-left text-coral hover:text-lightOrange text-5xl"></i>
                    </button>

                    {/* Carousel container */}
                    <div className="bg-cerulean flex h-72 flex-grow items-center overflow-hidden rounded-xl p-4 shadow">
                      <div
                        className="flex flex-nowrap transition-transform duration-300"
                        style={{
                          transform: `translateX(-${(carouselIndex[category] || 0) * 256}px)`,
                        }}
                      >
                        {showRec[category].map((recommendation) => (
                          <div
                            key={recommendation._id}
                            className="mx-2 w-60 flex-shrink-0"
                          >
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

                              {/* Footer section with recommender and action buttons */}
                              <div className="bg-lightTanGray relative flex items-center justify-between p-2">
                                <button
                                  onClick={() =>
                                    handleDeleteRecommendation(
                                      recommendation._id,
                                    )
                                  }
                                  className="text-hotCoralPink transition-colors hover:text-pink-600"
                                  aria-label="Delete recommendation"
                                >
                                  <i className="fa-solid fa-trash text-sm"></i>
                                </button>
                                <span className="absolute left-1/2 -translate-x-1/2 transform text-xs text-gray-600">
                                  {recommendation.user &&
                                  recommendation.user._id === currentUserId
                                    ? "Recommended: Self"
                                    : `Recommended by ${recommendation.user?.username?.charAt(0).toUpperCase() + recommendation.user?.username?.slice(1) || "Unknown"}`}
                                </span>

                                <button
                                  onClick={() =>
                                    handleRecommendClick(recommendation)
                                  }
                                  className="text-blue-500 transition-colors hover:text-blue-600"
                                  aria-label="Recommend to friend"
                                >
                                  <i className="fa-solid fa-share-from-square"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right arrow */}
                    <button
                      className="z-10 ml-4 p-2"
                      onClick={() =>
                        updateCarouselIndex(
                          category,
                          Math.min(
                            (carouselIndex[category] || 0) + 1,
                            (showRec[category]?.length || 0) - 1,
                          ),
                        )
                      }
                      disabled={
                        (carouselIndex[category] || 0) >=
                        (showRec[category]?.length || 0) - 1
                      }
                      aria-label="Next"
                    >
                      <i className="fa-solid fa-circle-chevron-right text-coral hover:text-lightOrange text-5xl"></i>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Share existing recommendation modal */}
      <RecommendToFriendModal
        isOpen={showRecommendModal}
        onClose={() => setShowRecommendModal(false)}
        recommendation={selectedRecommendation}
        onRecommend={handleRecommendSubmit}
      />

      {/* Create and share new recommendation modal */}
      <CreateAndShareModal
        isOpen={showCreateShareModal}
        onClose={() => setShowCreateShareModal(false)}
        onCreateAndShare={handleCreateAndShare}
      />
    </div>
  );
};

export default MyRecommendations;
