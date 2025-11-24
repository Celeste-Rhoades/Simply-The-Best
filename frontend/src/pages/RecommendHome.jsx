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

  // See more modal state
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState({
    title: "",
    description: "",
  });

  // See more title modal state
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState("");

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

  // See more description function
  const handleSeeMore = (title, description) => {
    setSelectedDescription({ title, description });
    setShowDescriptionModal(true);
  };

  // See more title function
  const handleSeeTitleMore = (title) => {
    setSelectedTitle(title);
    setShowTitleModal(true);
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

  // Dynamic margin based on title length to keep consistent spacing to description
  const getTitleMargin = (title) => {
    const length = title.length;
    // Adjust margin based on how many lines the title likely takes
    if (length > 40) {
      // 2 lines - less margin
      return "mb-0.5 sm:mb-1";
    } else {
      // 1 line - more margin
      return "mb-1.5 sm:mb-2";
    }
  };

  return (
    <div className="bg-lightTanGray relative flex min-h-screen w-full flex-col">
      <NavBar />

      {/* Mobile and Desktop: Add Button - centered on mobile, right-aligned on desktop */}
      <div className="mx-4 mt-4 flex justify-center sm:mx-8 sm:justify-end">
        <button
          className="bg-coral font-raleway hover:bg-hotCoralPink rounded-md px-3 py-2 text-sm text-white shadow-lg transition-colors sm:mx-4 sm:px-4"
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
      <div className="mx-4 mt-8 sm:mx-8">
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
                <h2 className="font-boldRaleway text-darkBlue mb-4 pb-4 text-2xl">
                  {userdata.username?.charAt(0).toUpperCase() +
                    userdata.username?.slice(1)}
                  's Recommendations
                </h2>

                {/* Carousel Container */}
                <div className="relative flex items-center">
                  {/* Left Arrow */}
                  <button
                    className="z-10 p-1 sm:mr-4 sm:p-2"
                    onClick={() =>
                      updateCarouselIndex(
                        userId,
                        Math.max((carouselIndex[userId] || 0) - 1, 0),
                      )
                    }
                    disabled={(carouselIndex[userId] || 0) === 0}
                    aria-label="Previous"
                  >
                    <i className="fa-solid fa-circle-chevron-left text-coral hover:text-lightOrange text-2xl sm:text-5xl"></i>
                  </button>

                  {/* Recommendations Carousel */}
                  <div
                    className="flex h-[228px] flex-grow items-center overflow-hidden rounded-xl p-4 shadow-xl sm:h-[316px] sm:justify-start sm:p-4"
                    style={{
                      background:
                        "linear-gradient(135deg, #ff8a95, #fbbfa2, #23dee5)",
                    }}
                  >
                    {/* Mobile and Desktop: show all cards with natural overflow */}
                    <div
                      className="flex gap-2 transition-transform duration-300 sm:gap-4"
                      style={{
                        transform: `translateX(-${(carouselIndex[userId] || 0) * (window.innerWidth >= 640 ? 272 : 184)}px)`,
                      }}
                    >
                      {userdata.recommendations.map((recommendation) => (
                        <div
                          key={recommendation._id}
                          className="w-44 flex-shrink-0 sm:w-64"
                        >
                          <div className="flex h-[212px] w-44 flex-col overflow-hidden rounded-lg bg-[#f8ede6] shadow-lg sm:h-[300px] sm:w-64">
                            {/* Header section with title and stars - 2 LINES MAX */}
                            <div className="relative h-[68px] flex-shrink-0 bg-[#f8ede6] px-1.5 pt-1.5 text-center sm:h-[84px] sm:px-2 sm:pt-2">
                              {recommendation.title &&
                              recommendation.title.length > 60 ? (
                                <button
                                  onClick={() =>
                                    handleSeeTitleMore(recommendation.title)
                                  }
                                  className={`font-boldManrope text-darkBlue ${getTitleMargin(recommendation.title)} line-clamp-2 text-[10.5px] leading-[1.2] font-bold break-words transition-colors hover:text-gray-600 sm:text-[15px] sm:leading-[1.3]`}
                                  title="Click to see full title"
                                >
                                  {toTitleCase(recommendation.title)}
                                </button>
                              ) : (
                                <h3
                                  className={`font-boldManrope text-darkBlue ${getTitleMargin(recommendation.title)} line-clamp-2 text-[10.5px] leading-[1.2] font-bold break-words sm:text-[15px] sm:leading-[1.3]`}
                                  title={recommendation.title}
                                >
                                  {toTitleCase(recommendation.title)}
                                </h3>
                              )}

                              <div className="flex justify-center gap-0.5 sm:gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span
                                    key={star}
                                    className={
                                      star <= recommendation.rating
                                        ? "text-lighTeal text-[11px] sm:text-[15px]"
                                        : "text-[11px] text-gray-300 sm:text-[15px]"
                                    }
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Description section - GROWS to fill available space */}
                            <div className="relative m-1 flex flex-grow items-center justify-center bg-[#4a6a7d] p-1.5 text-white sm:m-2 sm:p-3">
                              <p className="text-center text-[10px] leading-tight break-words sm:text-sm">
                                {recommendation.description &&
                                recommendation.description.length > 100
                                  ? `${recommendation.description.substring(0, 100)}...`
                                  : recommendation.description || "Description"}
                              </p>

                              {/* See more button - bottom right corner */}
                              {recommendation.description &&
                                recommendation.description.length > 100 && (
                                  <button
                                    onClick={() =>
                                      handleSeeMore(
                                        recommendation.title,
                                        recommendation.description,
                                      )
                                    }
                                    className="absolute right-1 bottom-1 text-[8px] text-white/80 underline hover:text-white sm:text-[10px]"
                                  >
                                    see more
                                  </button>
                                )}
                            </div>

                            {/* Footer section - FIXED compact height */}
                            <div className="flex h-8 flex-shrink-0 items-center justify-between bg-[#f8ede6] px-2 sm:h-10 sm:px-3">
                              <button
                                onClick={() => handleCopyClick(recommendation)}
                                className="text-hotCoralPink transition-colors hover:text-pink-600"
                                aria-label="Add to my recommendations"
                              >
                                <i className="fa-solid fa-plus text-[10px] sm:text-sm"></i>
                              </button>

                              <p className="truncate px-0.5 text-center text-[9px] text-gray-600 sm:px-1 sm:text-xs">
                                {recommendation.originalRecommendedBy
                                  ? `Originally by ${recommendation.originalRecommendedBy.username?.charAt(0).toUpperCase() + recommendation.originalRecommendedBy.username?.slice(1)}`
                                  : `By ${recommendation.user.username?.charAt(0).toUpperCase() + recommendation.user.username?.slice(1)}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Arrow */}
                  <button
                    className="z-10 p-1 sm:ml-4 sm:p-2"
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
                    <i className="fa-solid fa-circle-chevron-right text-coral hover:text-lightOrange text-2xl sm:text-5xl"></i>
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

      {/* Description modal - See more */}
      <Dialog
        open={showDescriptionModal}
        onClose={() => setShowDescriptionModal(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      >
        <DialogPanel className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
          <h3 className="mb-4 text-xl font-bold text-gray-800">
            {toTitleCase(selectedDescription.title)}
          </h3>
          <p className="whitespace-pre-wrap text-gray-700">
            {selectedDescription.description}
          </p>
          <button
            onClick={() => setShowDescriptionModal(false)}
            className="bg-tangerine hover:bg-lightOrange mt-4 w-full rounded px-4 py-2 text-white"
          >
            Close
          </button>
        </DialogPanel>
      </Dialog>

      {/* Title modal - See more */}
      <Dialog
        open={showTitleModal}
        onClose={() => setShowTitleModal(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      >
        <DialogPanel className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
          <h3 className="mb-4 text-xl font-bold text-gray-800">Full Title</h3>
          <p className="whitespace-pre-wrap text-gray-700">
            {toTitleCase(selectedTitle)}
          </p>
          <button
            onClick={() => setShowTitleModal(false)}
            className="bg-tangerine hover:bg-lightOrange mt-4 w-full rounded px-4 py-2 text-white"
          >
            Close
          </button>
        </DialogPanel>
      </Dialog>
    </div>
  );
};

export default RecommendHome;
