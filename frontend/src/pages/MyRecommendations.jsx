import { useState, useEffect } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { useNavigate } from "react-router-dom";

import apiFetch from "services/apiFetch";
import NavBar from "shared-components/NavBar";
import RecommendAddModal from "./RecommendAddModal";
import RecommendEditModal from "./RecommendEditModal";
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

  // See more modal state
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState({
    title: "",
    description: "",
  });

  // See more title modal state
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState("");

  // Edit modal state
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

  // Edit recommendation function
  const handleEditRecommendation = (recommendation) => {
    setRecommendationToEdit(recommendation);
    setShowEditModal(true);
  };

  // Handle edit modal close
  const handleEditModalClose = (success) => {
    setShowEditModal(false);
    if (success) {
      fetchGroupRecs(); // Refresh recommendations after edit
    }
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
    <div className="bg-lightTanGray relative flex min-h-screen w-full flex-col">
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

      {/* Mobile: Two-row layout | Desktop: Single row */}
      <div className="mx-4 mt-4 sm:mx-8">
        {/* Row 1: Add recommendation + Pending (Mobile only) */}
        <div className="flex justify-center gap-2 sm:hidden">
          <button
            className="bg-coral font-raleway hover:bg-hotCoralPink rounded-md px-3 py-2 text-sm text-white shadow-lg transition-colors"
            onClick={() => setShowForm(true)}
          >
            Add recommendation
          </button>
          <button
            onClick={() => navigate(routes.pendingRecommendations)}
            className="hover:bg-lighTeal font-raleway rounded-md bg-[#69c8d4] px-3 py-2 text-sm text-white shadow-lg transition-colors"
          >
            Pending ({pendingCount})
          </button>
        </div>

        {/* Row 2: Recommend to Friends (Mobile only) */}
        <div className="mt-2 flex justify-center sm:hidden">
          <button
            className="font-raleway bg-tangerine hover:bg-brightSalmon rounded-md px-3 py-2 text-sm text-white shadow-lg transition-colors"
            onClick={() => setShowCreateShareModal(true)}
          >
            Recommend to Friends
          </button>
        </div>

        {/* Desktop: Single row (original layout) */}
        <div className="hidden justify-end sm:flex">
          <button
            className="bg-coral font-raleway hover:bg-hotCoralPink mx-2 rounded-md px-4 py-2 text-white shadow-lg transition-colors"
            onClick={() => setShowForm(true)}
          >
            Add recommendation
          </button>

          <button
            className="font-raleway bg-tangerine hover:bg-brightSalmon mx-2 rounded-md px-4 py-2 text-white shadow-lg transition-colors"
            onClick={() => setShowCreateShareModal(true)}
          >
            Recommend to Friends
          </button>

          <button
            onClick={() => navigate(routes.pendingRecommendations)}
            className="hover:bg-lighTeal font-raleway mx-2 rounded-md bg-[#69c8d4] px-4 py-2 text-white shadow-lg transition-colors"
          >
            Pending ({pendingCount})
          </button>
        </div>
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

      <div className="mx-4 mt-8 sm:mx-8">
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
                  <h2 className="font-boldRaleway text-darkBlue mb-4 pb-4 text-2xl">
                    {toTitleCase(category)}
                  </h2>

                  {/* Carousel Container */}
                  <div className="relative flex items-center">
                    {/* Left arrow */}
                    <button
                      className="z-10 p-1 sm:mr-4 sm:p-2"
                      onClick={() =>
                        updateCarouselIndex(
                          category,
                          Math.max((carouselIndex[category] || 0) - 1, 0),
                        )
                      }
                      disabled={(carouselIndex[category] || 0) === 0}
                      aria-label="Previous"
                    >
                      <i className="fa-solid fa-circle-chevron-left text-coral hover:text-lightOrange text-2xl sm:text-5xl"></i>
                    </button>

                    {/* Carousel container */}
                    <div
                      className="flex h-[228px] flex-grow items-center overflow-hidden rounded-xl p-4 shadow-lg sm:h-[316px] sm:justify-start sm:p-4"
                      style={{
                        background:
                          "linear-gradient(135deg, #ff8a95, #fbbfa2, #23dee5)",
                      }}
                    >
                      {/* Mobile and Desktop: show all cards with natural overflow */}
                      <div
                        className="flex gap-2 transition-transform duration-300 sm:gap-4"
                        style={{
                          transform: `translateX(-${(carouselIndex[category] || 0) * (window.innerWidth >= 640 ? 272 : 184)}px)`,
                        }}
                      >
                        {showRec[category].map((recommendation) => (
                          <div
                            key={recommendation._id}
                            className="w-44 flex-shrink-0 sm:w-64"
                          >
                            <div className="relative flex h-[212px] w-44 flex-col overflow-hidden rounded-lg bg-[#f8ede6] shadow-lg sm:h-[300px] sm:w-64">
                              {/* EDIT BUTTON - Top right corner - higher position */}
                              <button
                                onClick={() =>
                                  handleEditRecommendation(recommendation)
                                }
                                className="absolute top-0.5 right-1 z-10 text-gray-600 transition-colors hover:text-gray-800 sm:top-1 sm:right-2"
                                aria-label="Edit recommendation"
                              >
                                <i className="fa-solid fa-pencil text-[10px] sm:text-xs"></i>
                              </button>

                              {/* Header section with title and stars - 2 LINES MAX */}
                              <div className="text-darkBlue relative h-[68px] flex-shrink-0 bg-[#f8ede6] px-1.5 pt-1.5 text-center sm:h-[84px] sm:px-2 sm:pt-2">
                                {recommendation.title &&
                                recommendation.title.length > 60 ? (
                                  <button
                                    onClick={() =>
                                      handleSeeTitleMore(recommendation.title)
                                    }
                                    className={`font-boldManrope ${getTitleMargin(recommendation.title)} line-clamp-2 text-[10.5px] leading-[1.2] font-bold break-words transition-colors hover:text-gray-600 sm:text-[15px] sm:leading-[1.3]`}
                                    title="Click to see full title"
                                  >
                                    {toTitleCase(recommendation.title)}
                                  </button>
                                ) : (
                                  <h3
                                    className={`font-boldManrope ${getTitleMargin(recommendation.title)} line-clamp-2 text-[10.5px] leading-[1.2] font-bold break-words sm:text-[15px] sm:leading-[1.3]`}
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

                              {/* Description section - GROWS to fill available space */}
                              <div className="relative m-1 flex flex-grow items-center justify-center bg-[#4a6a7d] p-1.5 text-white sm:m-2 sm:p-3">
                                <p className="text-center text-[10px] leading-tight break-words sm:text-sm">
                                  {recommendation.description &&
                                  recommendation.description.length > 100
                                    ? `${recommendation.description.substring(0, 100)}...`
                                    : recommendation.description ||
                                      "Description"}
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
                                  onClick={() =>
                                    handleDeleteRecommendation(
                                      recommendation._id,
                                    )
                                  }
                                  className="text-hotCoralPink transition-colors hover:text-pink-600"
                                  aria-label="Delete recommendation"
                                >
                                  <i className="fa-solid fa-trash text-[10px] sm:text-sm"></i>
                                </button>

                                <p className="truncate px-0.5 text-center text-[9px] text-gray-600 sm:px-1 sm:text-xs">
                                  {recommendation.user &&
                                  recommendation.user._id === currentUserId
                                    ? "Self"
                                    : `By ${recommendation.user?.username?.charAt(0).toUpperCase() + recommendation.user?.username?.slice(1) || "Unknown"}`}
                                </p>

                                <button
                                  onClick={() =>
                                    handleRecommendClick(recommendation)
                                  }
                                  className="text-[#62d3c2] transition-colors hover:text-[#59bbac]"
                                  aria-label="Recommend to friend"
                                >
                                  <i className="fa-solid fa-share-from-square text-[10px] sm:text-sm"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right arrow */}
                    <button
                      className="z-10 p-1 sm:ml-4 sm:p-2"
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
                      <i className="fa-solid fa-circle-chevron-right text-coral hover:text-lightOrange text-2xl sm:text-5xl"></i>
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

      {/* Edit recommendation modal */}
      <RecommendEditModal
        isOpen={showEditModal}
        onClose={handleEditModalClose}
        recommendation={recommendationToEdit}
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

export default MyRecommendations;
