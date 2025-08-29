import { useState, useEffect, useRef } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";

import NavBar from "shared-components/NavBar";
import RecommendAddModal from "./RecommendAddModal";
import CopyRecommendationModal from "../Components/CopyRecommendationModal";
import { useFriendsRecommendations } from "../hooks/userFriendsRecommendations";

const RecommendHome = () => {
  const [showForm, setShowForm] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState({});
  const [copySuccess, setCopySuccess] = useState("");

  const loadMoreRef = useRef(null);

  const {
    friendsRecs,
    isLoading,
    error,
    hasMore,
    loadMoreFriends,
    copyRecommendation,
    refreshRecs,
  } = useFriendsRecommendations();

  // Lazy loading intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMoreFriends();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMoreFriends]);

  const handleModalClose = () => {
    setShowForm(false);
    refreshRecs();
  };

  const handleCopyClick = (recommendation) => {
    setSelectedRecommendation(recommendation);
    setShowCopyModal(true);
  };

  const handleCopySubmit = async (originalId, updatedData) => {
    const result = await copyRecommendation(originalId, updatedData);
    if (result.success) {
      setCopySuccess("Recommendation added to your list!");
      setTimeout(() => setCopySuccess(""), 3000);
      setShowCopyModal(false);
      refreshRecs();
    }
    return result;
  };

  const updateCarouselIndex = (userId, newIdx) => {
    setCarouselIndex((prev) => ({
      ...prev,
      [userId]: newIdx,
    }));
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

      {/* Header with Add Button */}
      <div className="mx-8 mt-4 flex justify-end">
        <button
          className="bg-coral font-raleway mx-4 rounded-md px-4 py-2 text-white shadow-lg"
          onClick={() => setShowForm(true)}
        >
          Add recommendation
        </button>
      </div>

      {/* Success Message */}
      {copySuccess && (
        <div className="mx-8 mt-4 rounded bg-green-100 p-3 text-green-700">
          {copySuccess}
        </div>
      )}

      {/* Main Content */}
      <div className="mx-8 mt-8">
        {isLoading && Object.keys(friendsRecs).length === 0 ? (
          <div className="font-manrope flex items-center justify-center py-12">
            <p className="text-lg text-gray-600">
              Loading friends' recommendations...
            </p>
          </div>
        ) : error ? (
          <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            <p className="mb-2">{error}</p>
            <button
              onClick={refreshRecs}
              className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        ) : Object.keys(friendsRecs).length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-raleway text-lg text-gray-600">
              No recommendations from friends yet. Add some friends to see their
              recommendations!
            </p>
          </div>
        ) : (
          <div className="font-raleway">
            {Object.entries(friendsRecs).map(([userId, userdata]) => (
              <div key={userId} className="mb-8">
                {/* Friend's Username Header */}
                <h2 className="font-boldRaleway mb-4 pb-4 text-2xl">
                  {userdata.username?.charAt(0).toUpperCase() +
                    userdata.username?.slice(1)}
                  's Recommendations
                </h2>

                {/* Carousel Container */}
                <div className="relative flex items-center">
                  {/* Left Arrow */}
                  <button
                    className="z-10 mr-4 p-2"
                    onClick={() =>
                      updateCarouselIndex(
                        userId,
                        Math.max((carouselIndex[userId] || 0) - 1, 0),
                      )
                    }
                    disabled={(carouselIndex[userId] || 0) === 0}
                    aria-label="Previous"
                  >
                    <i className="fa-solid fa-circle-chevron-left text-coral hover:text-lightOrange text-5xl"></i>
                  </button>

                  {/* Recommendations Carousel */}
                  <div className="bg-cerulean flex h-72 flex-grow items-center overflow-hidden rounded-xl p-4 shadow">
                    <div
                      className="flex flex-nowrap transition-transform duration-300"
                      style={{
                        transform: `translateX(-${(carouselIndex[userId] || 0) * 256}px)`,
                      }}
                    >
                      {userdata.recommendations.map((recommendation) => (
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

                            {/* Footer section with plus sign and original recommender */}
                            <div className="bg-lightTanGray relative flex items-center justify-between p-2">
                              {/* Plus sign button - bottom left */}
                              <button
                                onClick={() => handleCopyClick(recommendation)}
                                className="text-hotCoralPink transition-colors hover:text-pink-600"
                                aria-label="Add to my recommendations"
                              >
                                <i className="fa-solid fa-plus text-sm"></i>
                              </button>

                              {/* Original recommender info - centered */}
                              <span className="absolute left-1/2 -translate-x-1/2 transform text-xs text-gray-600">
                                {recommendation.originalRecommendedBy
                                  ? `Originally by ${recommendation.originalRecommendedBy.username?.charAt(0).toUpperCase() + recommendation.originalRecommendedBy.username?.slice(1)}`
                                  : `By ${recommendation.user.username?.charAt(0).toUpperCase() + recommendation.user.username?.slice(1)}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Arrow */}
                  <button
                    className="z-10 ml-4 p-2"
                    onClick={() =>
                      updateCarouselIndex(
                        userId,
                        Math.min(
                          (carouselIndex[userId] || 0) + 1,
                          (userdata.recommendations?.length || 0) - 1,
                        ),
                      )
                    }
                    disabled={
                      (carouselIndex[userId] || 0) >=
                      (userdata.recommendations?.length || 0) - 1
                    }
                    aria-label="Next"
                  >
                    <i className="fa-solid fa-circle-chevron-right text-coral hover:text-lightOrange text-5xl"></i>
                  </button>
                </div>
              </div>
            ))}

            {/* Lazy Loading Trigger */}
            {hasMore && (
              <div ref={loadMoreRef} className="py-8 text-center">
                <p className="text-gray-600">Loading more friends...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Recommendation Modal */}
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

      {/* Copy Recommendation Modal */}
      <CopyRecommendationModal
        isOpen={showCopyModal}
        onClose={() => setShowCopyModal(false)}
        originalRec={selectedRecommendation}
        onCopy={handleCopySubmit}
      />
    </div>
  );
};

export default RecommendHome;
