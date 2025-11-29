import { useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { useTheme } from "../contexts/ThemeContext";
import { useSwipeable } from "react-swipeable";

import NavBar from "shared-components/NavBar";
import RecommendAddModal from "./RecommendAddModal";
import CopyRecommendationModal from "../Components/CopyRecommendationModal";
import CreateAndShareModal from "../pages/CreateAndShareModal";
import { useFriendsRecommendations } from "../hooks/userFriendsRecommendations";
import { useFriendRecommendations } from "../hooks/useFriendRecommendations";

const RecommendHome = () => {
  const [showForm, setShowForm] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState({});
  const [copySuccess, setCopySuccess] = useState("");
  const { isDarkMode } = useTheme();

  // Create and share new recommendation states
  const [showCreateShareModal, setShowCreateShareModal] = useState(false);
  const [createShareSuccess, setCreateShareSuccess] = useState("");

  // See more modal state
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState({
    title: "",
    description: "",
  });

  // See more title modal state
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState("");

  const { friendsRecs, isLoading, error, copyRecommendation } =
    useFriendsRecommendations();

  const { recommendToFriend } = useFriendRecommendations();

  const handleModalClose = () => {
    setShowForm(false);
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
      setTimeout(() => window.location.reload(), 1500);
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

  const getTitleMargin = (title) => {
    const length = title.length;
    if (length > 40) {
      return "mb-1.5 sm:mb-1.5";
    } else {
      return "mb-2 sm:mb-2.5";
    }
  };

  // Component for individual carousel with swipe
  const CarouselWithSwipe = ({ userId, userdata }) => {
    const maxIndex = userdata.recommendations.length - 1;
    const currentIndex = carouselIndex[userId] || 0;

    const handlers = useSwipeable({
      onSwipedLeft: () => {
        if (currentIndex < maxIndex) {
          updateCarouselIndex(userId, currentIndex + 1);
        }
      },
      onSwipedRight: () => {
        if (currentIndex > 0) {
          updateCarouselIndex(userId, currentIndex - 1);
        }
      },
      trackMouse: false,
      trackTouch: true,
      preventScrollOnSwipe: true,
    });

    return (
      <div className="mb-8">
        <h2
          className={`font-boldRaleway mb-4 pb-4 text-2xl ${isDarkMode ? "text-white" : "text-darkBlue"}`}
        >
          {userdata.username?.charAt(0).toUpperCase() +
            userdata.username?.slice(1)}
          's Recommendations
        </h2>

        <div className="relative flex items-center">
          {/* Left arrow - Hidden on mobile, visible on tablet+ */}
          <button
            className="z-10 hidden p-2 sm:mr-4 sm:block"
            onClick={() =>
              updateCarouselIndex(userId, Math.max(currentIndex - 1, 0))
            }
            disabled={currentIndex === 0}
            aria-label="Previous"
          >
            <i className="fa-solid fa-circle-chevron-left text-coral hover:text-lightOrange text-5xl"></i>
          </button>

          {/* Carousel container with swipe handlers */}
          <div
            {...handlers}
            className="flex h-[260px] flex-grow items-center justify-start overflow-hidden rounded-xl px-4 py-4 shadow-xl sm:h-[340px] sm:px-4 sm:py-6"
            style={{
              background: "linear-gradient(135deg, #ff8a95, #fbbfa2, #23dee5)",
            }}
          >
            <div
              className="flex gap-2 transition-transform duration-300 sm:gap-4"
              style={{
                transform: `translateX(-${currentIndex * (window.innerWidth >= 640 ? 272 : 184)}px)`,
              }}
            >
              {userdata.recommendations.map((recommendation) => (
                <div
                  key={recommendation._id}
                  className="w-44 flex-shrink-0 sm:w-64"
                >
                  <div className="flex h-[232px] w-44 flex-col overflow-hidden rounded-lg bg-[#f8ede6] shadow-lg sm:h-[314px] sm:w-64">
                    {/* Header section with MORE TOP PADDING */}
                    <div className="relative h-[76px] flex-shrink-0 bg-[#f8ede6] px-1.5 pt-5 text-center sm:h-[84px] sm:px-2 sm:pt-5">
                      {recommendation.title &&
                      recommendation.title.length > 60 ? (
                        <button
                          onClick={() =>
                            handleSeeTitleMore(recommendation.title)
                          }
                          className={`font-boldManrope text-darkBlue ${getTitleMargin(recommendation.title)} line-clamp-2 text-[10.5px] leading-[1.35] font-bold break-words transition-colors hover:text-gray-600 sm:text-[15px] sm:leading-[1.3]`}
                          title="Click to see full title"
                        >
                          {toTitleCase(recommendation.title)}
                        </button>
                      ) : (
                        <h3
                          className={`font-boldManrope text-darkBlue ${getTitleMargin(recommendation.title)} line-clamp-2 text-[10.5px] leading-[1.35] font-bold break-words sm:text-[15px] sm:leading-[1.3]`}
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
                                ? "text-cerulean text-[11px] sm:text-[15px]"
                                : "text-[11px] text-gray-300 sm:text-[15px]"
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="relative m-1 flex flex-grow items-center justify-center bg-[#4a6a7d] p-1.5 text-white sm:m-2 sm:p-3">
                      <p className="text-center text-[10px] leading-tight break-words sm:text-sm">
                        {recommendation.description &&
                        recommendation.description.length > 100
                          ? `${recommendation.description.substring(0, 100)}...`
                          : recommendation.description || "Description"}
                      </p>

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

                    <div className="flex h-12 flex-shrink-0 flex-col justify-between bg-[#f8ede6] px-2 py-1 sm:h-14 sm:px-3 sm:py-1.5">
                      <p className="font-boldManrope text-darkBlue text-center text-[11px] sm:text-sm">
                        {toTitleCase(recommendation.category)}
                      </p>

                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleCopyClick(recommendation)}
                          className="text-[#62d3c2] transition-colors hover:text-[#59bbac]"
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
                </div>
              ))}
            </div>
          </div>

          {/* Right arrow - Hidden on mobile, visible on tablet+ */}
          <button
            className="z-10 hidden p-2 sm:ml-4 sm:block"
            onClick={() =>
              updateCarouselIndex(userId, Math.min(currentIndex + 1, maxIndex))
            }
            disabled={currentIndex >= maxIndex}
            aria-label="Next"
          >
            <i className="fa-solid fa-circle-chevron-right text-coral hover:text-lightOrange text-5xl"></i>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`relative flex min-h-screen w-full flex-col ${isDarkMode ? "bg-gray-800" : "bg-lightTanGray"}`}
    >
      <NavBar />

      {/* Success Messages */}
      {copySuccess && (
        <div className="mx-8 mt-4 rounded bg-green-100 p-3 text-green-700">
          {copySuccess}
        </div>
      )}
      {createShareSuccess && (
        <div className="mx-8 mt-4 rounded bg-green-100 p-3 text-green-700">
          {createShareSuccess}
        </div>
      )}

      {/* Mobile and Desktop Button Layout */}
      <div className="mx-4 mt-4 sm:mx-8">
        {/* Mobile: Side by side with shorter text */}
        <div className="flex justify-center gap-2 sm:hidden">
          <button
            className="bg-coral font-raleway hover:bg-hotCoralPink flex-1 rounded-md px-2 py-2 text-xs text-white shadow-lg transition-colors"
            onClick={() => setShowForm(true)}
          >
            Add Recommendation
          </button>
          <button
            className="font-raleway bg-lightOrange flex-1 rounded-md px-2 py-2 text-xs text-white shadow-lg transition-colors hover:bg-[#ff9e66]"
            onClick={() => setShowCreateShareModal(true)}
          >
            Recommend to friend
          </button>
        </div>

        {/* Desktop: layout */}
        <div className="hidden sm:flex sm:justify-end">
          <button
            className="bg-coral font-raleway hover:bg-hotCoralPink mx-2 rounded-md px-4 py-2 text-white shadow-lg transition-colors"
            onClick={() => setShowForm(true)}
          >
            Add recommendation
          </button>

          <button
            className="font-raleway bg-lightOrange mx-2 rounded-md px-4 py-2 text-white shadow-lg transition-colors hover:bg-[#ff9e66]"
            onClick={() => setShowCreateShareModal(true)}
          >
            Recommend to Friends
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-4 mt-8 sm:mx-8">
        {isLoading && Object.keys(friendsRecs).length === 0 ? (
          <div className="font-manrope flex items-center justify-center py-12">
            <p
              className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Loading friends' recommendations...
            </p>
          </div>
        ) : error ? (
          <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            <p className="mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        ) : Object.keys(friendsRecs).length === 0 ? (
          <div className="py-12 text-center">
            <p
              className={`font-raleway text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              No recommendations from friends yet. Add some friends to see their
              recommendations!
            </p>
          </div>
        ) : (
          <div className="font-raleway">
            {Object.entries(friendsRecs).map(([userId, userdata]) => (
              <CarouselWithSwipe
                key={userId}
                userId={userId}
                userdata={userdata}
              />
            ))}
          </div>
        )}
      </div>

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

      <CopyRecommendationModal
        isOpen={showCopyModal}
        onClose={() => setShowCopyModal(false)}
        originalRec={selectedRecommendation}
        onCopy={handleCopySubmit}
      />

      {/* Create and share new recommendation modal */}
      <CreateAndShareModal
        isOpen={showCreateShareModal}
        onClose={() => setShowCreateShareModal(false)}
        onCreateAndShare={handleCreateAndShare}
      />

      <Dialog
        open={showDescriptionModal}
        onClose={() => setShowDescriptionModal(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      >
        <DialogPanel className="mx-4 flex max-h-[85vh] w-full max-w-md flex-col rounded-lg bg-white p-6">
          <h3 className="mb-4 text-xl font-bold text-gray-800">
            {toTitleCase(selectedDescription.title)}
          </h3>
          <div className="flex-1 overflow-y-auto pr-2">
            <p className="whitespace-pre-wrap text-gray-700">
              {selectedDescription.description}
            </p>
          </div>
          <button
            onClick={() => setShowDescriptionModal(false)}
            className="bg-lightOrange hover:bg-hotCoralPink mt-4 w-full rounded px-4 py-2 text-white"
          >
            Close
          </button>
        </DialogPanel>
      </Dialog>

      <Dialog
        open={showTitleModal}
        onClose={() => setShowTitleModal(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      >
        <DialogPanel className="mx-4 flex max-h-[85vh] w-full max-w-md flex-col rounded-lg bg-white p-6">
          <h3 className="mb-4 text-xl font-bold text-gray-800">Full Title</h3>
          <div className="flex-1 overflow-y-auto pr-2">
            <p className="whitespace-pre-wrap text-gray-700">
              {toTitleCase(selectedTitle)}
            </p>
          </div>
          <button
            onClick={() => setShowTitleModal(false)}
            className="bg-lightOrange hover:bg-hotCoralPink mt-4 w-full rounded px-4 py-2 text-white"
          >
            Close
          </button>
        </DialogPanel>
      </Dialog>
    </div>
  );
};

export default RecommendHome;
