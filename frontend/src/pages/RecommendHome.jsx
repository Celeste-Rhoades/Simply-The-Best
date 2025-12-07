import { useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

import NavBar from "shared-components/NavBar";
import StarRating from "../shared-components/StarRating";
import ModalWrapper from "../shared-components/ModalWrapper";
import Carousel from "../shared-components/Carousel";
import RecommendAddModal from "../shared-components/modals/RecommendAddModal";
import CopyRecommendationModal from "../shared-components/modals/CopyRecommendationModal";
import CreateAndShareModal from "../shared-components/modals/CreateAndShareModal";
import SearchBar from "../shared-components/SearchBar";
import { useFriendsRecommendations } from "../hooks/userFriendsRecommendations";
import { useFriendRecommendations } from "../hooks/useFriendRecommendations";
import routes from "../routes";

const RecommendHome = () => {
  const [showForm, setShowForm] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState({});
  const [copySuccess, setCopySuccess] = useState("");
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [showSearchModal, setShowSearchModal] = useState(false);

  const [showCreateShareModal, setShowCreateShareModal] = useState(false);
  const [createShareSuccess, setCreateShareSuccess] = useState("");

  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState({
    title: "",
    description: "",
  });

  const [showTitleModal, setShowTitleModal] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState("");

  const { friendsRecs, isLoading, error, copyRecommendation } =
    useFriendsRecommendations();

  const { recommendToFriend, friends } = useFriendRecommendations();

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

  const handleSeeMore = (title, description) => {
    setSelectedDescription({ title, description });
    setShowDescriptionModal(true);
  };

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

  const renderTextWithLinks = (text) => {
    if (!text) return text;

    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (!part) return null;

      if (part.match(urlRegex)) {
        const href = part.startsWith("http") ? part : `https://${part}`;
        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all underline transition-opacity hover:opacity-80"
            style={{ color: "#00b8c4" }}
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  const renderCard = (recommendation) => (
    <div className="flex h-[232px] w-44 flex-col overflow-hidden rounded-lg bg-[#f8ede6] shadow-lg sm:h-[314px] sm:w-64">
      {/* Card header */}
      <div className="relative h-[76px] flex-shrink-0 bg-[#f8ede6] px-1.5 pt-5 text-center sm:h-[84px] sm:px-2 sm:pt-5">
        {recommendation.title && recommendation.title.length > 60 ? (
          <button
            onClick={() => handleSeeTitleMore(recommendation.title)}
            className={`font-header text-darkBlue ${getTitleMargin(recommendation.title)} line-clamp-2 text-[10.5px] leading-[1.35] break-words transition-colors hover:text-gray-600 sm:text-[15px] sm:leading-[1.3]`}
            aria-label={`View full title: ${recommendation.title}`}
          >
            {toTitleCase(recommendation.title)}
          </button>
        ) : (
          <h3
            className={`font-header text-darkBlue ${getTitleMargin(recommendation.title)} line-clamp-2 text-[10.5px] leading-[1.35] break-words sm:text-[15px] sm:leading-[1.3]`}
          >
            {toTitleCase(recommendation.title)}
          </h3>
        )}

        <StarRating rating={recommendation.rating} size="small" />
      </div>

      {/* Card description */}
      <div className="relative m-1 flex flex-grow items-center justify-center bg-[#4a6a7d] p-1.5 text-white sm:m-2 sm:p-3">
        <p className="font-body text-center text-[10px] leading-tight break-words sm:text-sm">
          {recommendation.description &&
          recommendation.description.length > 100 ? (
            <>
              {renderTextWithLinks(
                recommendation.description.substring(0, 100),
              )}
              ...
            </>
          ) : (
            renderTextWithLinks(recommendation.description) || ""
          )}
        </p>

        {recommendation.description &&
          recommendation.description.length > 100 && (
            <button
              onClick={() =>
                handleSeeMore(recommendation.title, recommendation.description)
              }
              className="font-body absolute right-1 bottom-1 text-[8px] text-white/80 underline hover:text-white sm:text-[10px]"
              aria-label={`Read full description for ${recommendation.title}`}
            >
              see more
            </button>
          )}
      </div>

      {/* Card footer */}
      <div className="flex h-12 flex-shrink-0 flex-col justify-between bg-[#f8ede6] px-2 py-1 sm:h-14 sm:px-3 sm:py-1.5">
        <p className="font-header text-darkBlue text-center text-[11px] sm:text-sm">
          {toTitleCase(recommendation.category)}
        </p>

        <div className="flex items-center justify-between">
          <button
            onClick={() => handleCopyClick(recommendation)}
            className="text-[#62d3c2] transition-colors hover:text-[#59bbac]"
            aria-label={`Add ${recommendation.title} to my recommendations`}
          >
            <i
              className="fa-solid fa-plus text-[10px] sm:text-sm"
              aria-hidden="true"
            ></i>
          </button>

          <p className="font-body truncate px-0.5 text-center text-[9px] text-gray-600 sm:px-1 sm:text-xs">
            {recommendation.originalRecommendedBy
              ? `Originally by ${recommendation.originalRecommendedBy.username?.charAt(0).toUpperCase() + recommendation.originalRecommendedBy.username?.slice(1)}`
              : `By ${recommendation.user.username?.charAt(0).toUpperCase() + recommendation.user.username?.slice(1)}`}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`relative flex min-h-screen w-full flex-col ${isDarkMode ? "bg-gray-800" : "bg-lightTanGray"}`}
    >
      <NavBar />

      {copySuccess && (
        <div
          className="mx-8 mt-4 rounded bg-green-100 p-3 text-green-700"
          role="status"
          aria-live="polite"
        >
          {copySuccess}
        </div>
      )}
      {createShareSuccess && (
        <div
          className="mx-8 mt-4 rounded bg-green-100 p-3 text-green-700"
          role="status"
          aria-live="polite"
        >
          {createShareSuccess}
        </div>
      )}

      {/* Action buttons */}
      <div className="mx-4 mt-4 sm:mx-8">
        {/* Mobile layout */}
        <div className="flex justify-center gap-2 sm:hidden">
          <button
            className="font-body bg-coral hover:bg-hotCoralPink flex-1 rounded-md px-2 py-2 text-xs text-white shadow-lg transition-colors"
            onClick={() => setShowForm(true)}
          >
            Add Recommendation
          </button>
          <button
            className="font-body bg-lightOrange flex-1 rounded-md px-2 py-2 text-xs text-white shadow-lg transition-colors hover:bg-[#ff9e66]"
            onClick={() => setShowCreateShareModal(true)}
          >
            Recommend to friend
          </button>
        </div>

        {/* Mobile second row */}
        <div className="mt-2 flex justify-center sm:hidden">
          <button
            className="font-body bg-cerulean w-full rounded-md px-2 py-2 text-xs text-white shadow-lg transition-colors hover:bg-[#0799ba]"
            onClick={() => navigate(routes.myRecommendations)}
          >
            My Recommendations
          </button>
        </div>

        {/* Desktop layout */}
        <div className="hidden sm:flex sm:justify-end">
          <button
            className="font-body bg-cerulean mx-2 rounded-md px-4 py-2 text-white shadow-lg transition-colors hover:bg-[#0799ba]"
            onClick={() => navigate(routes.myRecommendations)}
          >
            My Recommendations
          </button>
          <button
            className="font-body bg-coral hover:bg-hotCoralPink mx-2 rounded-md px-4 py-2 text-white shadow-lg transition-colors"
            onClick={() => setShowForm(true)}
          >
            Add recommendation
          </button>

          <button
            className="font-body bg-lightOrange mx-2 rounded-md px-4 py-2 text-white shadow-lg transition-colors hover:bg-[#ff9e66]"
            onClick={() => setShowCreateShareModal(true)}
          >
            Recommend to Friends
          </button>
        </div>
      </div>

      {/* Main content area */}
      <main className="mx-4 mt-8 sm:mx-8">
        {isLoading && Object.keys(friendsRecs).length === 0 ? (
          <div
            className="font-body flex items-center justify-center py-12"
            role="status"
            aria-live="polite"
          >
            <p
              className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Loading friends' recommendations...
            </p>
          </div>
        ) : error ? (
          <div
            className="font-body border-hotCoralPink text-hotCoralPink rounded border bg-red-100 px-4 py-3"
            role="alert"
          >
            <p className="mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-hotCoralPink rounded px-4 py-2 text-white hover:bg-[#e85a77]"
            >
              Try Again
            </button>
          </div>
        ) : friends.length === 0 ? (
          // Welcome message when user has no friends
          <div className="flex items-center justify-center py-12">
            <div className="max-w-md text-center">
              <h2
                className={`font-header mb-4 text-3xl ${isDarkMode ? "text-white" : "text-darkBlue"}`}
              >
                Welcome!
              </h2>
              <div
                className={`font-body mb-6 space-y-3 text-base ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                <div className="flex items-start gap-3">
                  <i
                    className="fa-solid fa-user-plus text-cerulean mt-1 text-xl"
                    aria-hidden="true"
                  ></i>
                  <p className="text-left">
                    Start by <strong>finding your friends</strong> so you can
                    see what they&apos;re loving.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <i
                    className="fa-solid fa-star text-cerulean mt-1 text-xl"
                    aria-hidden="true"
                  ></i>
                  <p className="text-left">
                    Once you add a few people, their recommendations will show
                    up here on your <strong>Home feed</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <i
                    className="fa-solid fa-share-nodes text-cerulean mt-1 text-xl"
                    aria-hidden="true"
                  ></i>
                  <p className="text-left">
                    And you can add your own in{" "}
                    <strong>My Recommendations.</strong> So it&apos;s easy to
                    share the things you&apos;re into.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  console.log("Find Friends button clicked!");
                  setShowSearchModal(true);
                }}
                className="font-body bg-cerulean rounded-md px-6 py-3 text-white shadow-lg transition-colors hover:bg-[#0799ba]"
              >
                <i
                  className="fa-solid fa-magnifying-glass mr-2"
                  aria-hidden="true"
                ></i>
                Find friends to follow
              </button>
            </div>
          </div>
        ) : Object.keys(friendsRecs).length === 0 ? (
          <div className="py-12 text-center">
            <p
              className={`font-body text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Add friends to see their recommendations
            </p>
          </div>
        ) : (
          <div className="font-body">
            {Object.entries(friendsRecs).map(([userId, userdata]) => (
              <Carousel
                key={userId}
                items={userdata.recommendations}
                sectionTitle={`${userdata.username?.charAt(0).toUpperCase() + userdata.username?.slice(1)}'s Recommendations`}
                sectionId={`user-${userId}-heading`}
                currentIndex={carouselIndex[userId] || 0}
                onIndexChange={(newIdx) => updateCarouselIndex(userId, newIdx)}
                renderCard={renderCard}
                ariaLabel={`recommendation from ${userdata.username}`}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add recommendation modal */}
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

      <CreateAndShareModal
        isOpen={showCreateShareModal}
        onClose={() => setShowCreateShareModal(false)}
        onCreateAndShare={handleCreateAndShare}
      />

      {/* Search modal */}
      <SearchBar
        isVisible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        externalControl={true}
      />

      {/* Description modal */}
      <ModalWrapper
        isOpen={showDescriptionModal}
        onClose={() => setShowDescriptionModal(false)}
        title={toTitleCase(selectedDescription.title)}
      >
        <div className="flex-1 overflow-y-auto pr-2">
          <p className="font-body whitespace-pre-wrap text-gray-700">
            {renderTextWithLinks(selectedDescription.description)}
          </p>
        </div>
        <button
          onClick={() => setShowDescriptionModal(false)}
          className="font-body bg-lightOrange hover:bg-hotCoralPink mt-4 w-full rounded px-4 py-2 text-white"
        >
          Close
        </button>
      </ModalWrapper>

      {/* Title modal */}
      <ModalWrapper
        isOpen={showTitleModal}
        onClose={() => setShowTitleModal(false)}
        title="Full Title"
      >
        <div className="flex-1 overflow-y-auto pr-2">
          <p className="font-body whitespace-pre-wrap text-gray-700">
            {toTitleCase(selectedTitle)}
          </p>
        </div>
        <button
          onClick={() => setShowTitleModal(false)}
          className="font-body bg-lightOrange hover:bg-hotCoralPink mt-4 w-full rounded px-4 py-2 text-white"
        >
          Close
        </button>
      </ModalWrapper>
    </div>
  );
};

export default RecommendHome;
