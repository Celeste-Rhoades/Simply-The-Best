import { useState, useEffect } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useNotifications } from "../contexts/NotificationContext";

import apiFetch from "services/apiFetch";
import NavBar from "shared-components/NavBar";
import StarRating from "../shared-components/StarRating";
import Carousel from "../shared-components/Carousel";
import ModalWrapper from "../shared-components/ModalWrapper";
import RecommendAddModal from "../shared-components/modals/RecommendAddModal";
import RecommendEditModal from "../shared-components/modals/RecommendEditModal";
import RecommendToFriendModal from "../shared-components/modals/RecommendToFriendModal";
import CreateAndShareModal from "../shared-components/modals/CreateAndShareModal";
import { useFriendRecommendations } from "../hooks/useFriendRecommendations";
import routes from "../routes";

const MyRecommendations = () => {
  const [showForm, setShowForm] = useState(false);
  const [showRec, setShowRec] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState("");
  const [carouselIndex, setCarouselIndex] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const { isDarkMode } = useTheme();
  const { setPendingRecommendationCount, pendingRecommendationCount } =
    useNotifications();

  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [recommendSuccess, setRecommendSuccess] = useState("");

  const [showCreateShareModal, setShowCreateShareModal] = useState(false);
  const [createShareSuccess, setCreateShareSuccess] = useState("");

  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState({
    title: "",
    description: "",
  });

  const [showTitleModal, setShowTitleModal] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [recommendationToEdit, setRecommendationToEdit] = useState(null);

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
    } catch (error) {
      console.error("Error fetching recommendations:", error);
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
    if (!confirm("Are you sure you want to delete this recommendation?")) {
      return;
    }

    setErrors("");

    try {
      const res = await apiFetch(
        "DELETE",
        `/api/recommendations/${recommendationId}`,
      );

      if (res.ok) {
        await fetchGroupRecs();
      } else {
        const errorData = await res.json();
        setErrors(errorData.error || "Failed to delete recommendation.");
      }
    } catch (error) {
      console.error("Error deleting recommendation:", error);
      setErrors("Network error. Please try again.");
    }
  };

  const handlePrivacyToggle = async (recommendationId) => {
    setErrors("");

    try {
      const res = await apiFetch(
        "PATCH",
        `/api/recommendations/${recommendationId}/privacy`,
      );

      if (res.ok) {
        await fetchGroupRecs();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setErrors(errorData.error || "Failed to update privacy.");
      }
    } catch (error) {
      console.error("Error updating privacy:", error);
      setErrors("Network error. Please try again.");
    }
  };

  const handleModalClose = () => {
    setShowForm(false);
    fetchGroupRecs();
  };

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

  const handleEditRecommendation = (recommendation) => {
    setRecommendationToEdit(recommendation);
    setShowEditModal(true);
  };

  const handleEditModalClose = (success) => {
    setShowEditModal(false);
    if (success) {
      fetchGroupRecs();
    }
  };

  useEffect(() => {
    fetchGroupRecs();
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
    <div className="relative flex h-[220px] w-44 flex-col overflow-hidden rounded-lg bg-[#f8ede6] shadow-lg sm:h-[300px] sm:w-64">
      {/* Edit button */}
      <button
        onClick={() => handleEditRecommendation(recommendation)}
        className="absolute top-0.5 right-0.5 z-10 text-gray-600 transition-colors hover:text-gray-800 sm:top-1 sm:right-1"
        aria-label={`Edit ${recommendation.title}`}
      >
        <i
          className="fa-solid fa-pencil text-[11px] sm:text-sm"
          aria-hidden="true"
        ></i>
      </button>

      {/* Card header */}
      <div className="text-darkBlue relative h-[76px] flex-shrink-0 bg-[#f8ede6] px-1.5 pt-5 text-center sm:h-[84px] sm:px-2 sm:pt-5">
        {recommendation.title && recommendation.title.length > 60 ? (
          <button
            onClick={() => handleSeeTitleMore(recommendation.title)}
            className={`font-header ${getTitleMargin(recommendation.title)} line-clamp-2 text-[10.5px] leading-[1.35] break-words transition-colors hover:text-gray-600 sm:text-[15px] sm:leading-[1.3]`}
            aria-label={`View full title: ${recommendation.title}`}
          >
            {toTitleCase(recommendation.title)}
          </button>
        ) : (
          <h3
            className={`font-header ${getTitleMargin(recommendation.title)} line-clamp-2 text-[10.5px] leading-[1.35] break-words sm:text-[15px] sm:leading-[1.3]`}
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
      <div className="flex h-12 flex-shrink-0 flex-col items-center justify-center bg-[#f8ede6] px-2 sm:h-14 sm:px-3">
        {/* Privacy toggle row */}
        <div className="mb-0.5 grid w-full grid-cols-3 items-center">
          <div className="justify-self-start">
            {recommendation.isPrivate && (
              <span className="font-body text-hotCoralPink px-1 text-[10px] whitespace-nowrap sm:text-xs">
                keep private
              </span>
            )}
          </div>

          {/* Privacy toggle switch */}
          <button
            onClick={() => handlePrivacyToggle(recommendation._id)}
            className="flex justify-center transition-colors"
            aria-label={`Privacy: ${recommendation.isPrivate ? "private" : "With Friends"}. Click to toggle`}
            role="switch"
            aria-checked={!recommendation.isPrivate}
          >
            <div
              className={`relative h-3 w-7 rounded-full transition-colors sm:h-3.5 sm:w-8 ${
                recommendation.isPrivate ? "bg-hotCoralPink" : "bg-green-500"
              }`}
            >
              <div
                className={`absolute top-0.5 h-2 w-2 rounded-full bg-white transition-transform sm:h-2.5 sm:w-2.5 ${
                  recommendation.isPrivate
                    ? "right-0.5 sm:right-0.5"
                    : "left-0.5 sm:left-0.5"
                }`}
              />
            </div>
          </button>

          <div className="justify-self-end">
            {!recommendation.isPrivate && (
              <span className="font-body px-1 text-[10px] whitespace-nowrap text-green-600 sm:text-xs">
                for friends
              </span>
            )}
          </div>
        </div>

        {/* Actions row */}
        <div className="grid w-full grid-cols-3 items-center">
          {/* Delete button */}
          <button
            onClick={() => handleDeleteRecommendation(recommendation._id)}
            className="text-hotCoralPink justify-self-start transition-colors hover:text-pink-600"
            aria-label={`Delete ${recommendation.title}`}
          >
            <i
              className="fa-solid fa-trash text-[10px] sm:text-sm"
              aria-hidden="true"
            ></i>
          </button>

          {/* Author name */}
          <p className="font-body truncate text-center text-[9px] text-gray-600 sm:text-xs">
            {recommendation.originalRecommendedBy
              ? `By ${recommendation.originalRecommendedBy.username?.charAt(0).toUpperCase() + recommendation.originalRecommendedBy.username?.slice(1) || "Unknown"}`
              : recommendation.user && recommendation.user._id === currentUserId
                ? "Self"
                : `By ${recommendation.user?.username?.charAt(0).toUpperCase() + recommendation.user?.username?.slice(1) || "Unknown"}`}
          </p>

          {/* Share button */}
          <button
            onClick={() => handleRecommendClick(recommendation)}
            className="justify-self-end text-[#62d3c2] transition-colors hover:text-[#59bbac]"
            aria-label={`Share ${recommendation.title} with a friend`}
          >
            <i
              className="fa-solid fa-share-from-square text-[10px] sm:text-sm"
              aria-hidden="true"
            ></i>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`relative flex min-h-screen w-full flex-col ${isDarkMode ? "bg-gray-800" : "bg-lightTanGray"}`}
    >
      <NavBar />

      {recommendSuccess && (
        <div
          className="font-body mx-8 mt-4 rounded bg-green-100 p-3 text-green-700"
          role="status"
          aria-live="polite"
        >
          {recommendSuccess}
        </div>
      )}
      {createShareSuccess && (
        <div
          className="font-body mx-8 mt-4 rounded bg-green-100 p-3 text-green-700"
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
            onClick={() => {
              setPendingRecommendationCount(0);
              navigate(routes.pendingRecommendations);
            }}
            className="font-body hover:bg-lighTeal relative flex-1 rounded-md bg-[#69c8d4] px-2 py-2 text-xs text-white shadow-lg transition-colors"
            aria-label={`View pending recommendations. ${pendingRecommendationCount} pending`}
          >
            Pending
            {pendingRecommendationCount > 0 && (
              <span
                className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: "var(--color-hotCoralPink)" }}
                aria-hidden="true"
              >
                {pendingRecommendationCount > 9
                  ? "9+"
                  : pendingRecommendationCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile second row */}
        <div className="mt-2 flex justify-center sm:hidden">
          <button
            className="font-body bg-lightOrange w-full rounded-md px-2 py-2 text-xs text-white shadow-lg transition-colors hover:bg-[#fe6a15]"
            onClick={() => setShowCreateShareModal(true)}
          >
            Recommend to friend
          </button>
        </div>

        {/* Desktop layout */}
        <div className="hidden sm:flex sm:justify-end">
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

          <button
            onClick={() => {
              setPendingRecommendationCount(0);
              navigate(routes.pendingRecommendations);
            }}
            className="font-body hover:bg-lighTeal relative mx-2 rounded-md bg-[#69c8d4] px-4 py-2 text-white shadow-lg transition-colors"
            aria-label={`View pending recommendations. ${pendingRecommendationCount} pending`}
          >
            Pending ({pendingRecommendationCount})
            {pendingRecommendationCount > 0 && (
              <span
                className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: "var(--color-hotCoralPink)" }}
                aria-hidden="true"
              >
                {pendingRecommendationCount > 9
                  ? "9+"
                  : pendingRecommendationCount}
              </span>
            )}
          </button>
        </div>
      </div>

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

      {/* Main content area */}
      <main className="mx-4 mt-8 sm:mx-8">
        {isLoading ? (
          <div
            className="font-body flex items-center justify-center py-12"
            role="status"
            aria-live="polite"
          >
            <p
              className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Loading recommendations...
            </p>
          </div>
        ) : errors ? (
          <div
            className="font-body border-hotCoralPink text-hotCoralPink rounded border bg-red-100 px-4 py-3"
            role="alert"
          >
            <p className="mb-2">{errors}</p>
            <button
              onClick={fetchGroupRecs}
              className="bg-hotCoralPink rounded px-4 py-2 text-white hover:bg-[#e85a77]"
            >
              Try Again
            </button>
          </div>
        ) : Object.keys(showRec).length === 0 ? (
          <div className="py-12 text-center">
            <p
              className={`font-body text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              No recommendations yet. Add your first one!
            </p>
          </div>
        ) : (
          <div className="font-body">
            {Object.keys(showRec)
              .sort((a, b) => {
                if (a === "better than all the rest") return -1;
                if (b === "better than all the rest") return 1;
                return a.localeCompare(b);
              })
              .map((category) => (
                <Carousel
                  key={category}
                  items={showRec[category]}
                  sectionTitle={toTitleCase(category)}
                  sectionId={`category-${category.replace(/\s+/g, "-")}-heading`}
                  currentIndex={carouselIndex[category] || 0}
                  onIndexChange={(newIdx) =>
                    updateCarouselIndex(category, newIdx)
                  }
                  renderCard={renderCard}
                  ariaLabel={`${category} recommendation`}
                />
              ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <RecommendToFriendModal
        isOpen={showRecommendModal}
        onClose={() => setShowRecommendModal(false)}
        recommendation={selectedRecommendation}
        onRecommend={handleRecommendSubmit}
      />

      <CreateAndShareModal
        isOpen={showCreateShareModal}
        onClose={() => setShowCreateShareModal(false)}
        onCreateAndShare={handleCreateAndShare}
      />

      <RecommendEditModal
        isOpen={showEditModal}
        onClose={handleEditModalClose}
        recommendation={recommendationToEdit}
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

export default MyRecommendations;
