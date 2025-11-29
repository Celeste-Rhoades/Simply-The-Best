import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogPanel } from "@headlessui/react";
import { useTheme } from "../contexts/ThemeContext";
import { useNotifications } from "../contexts/NotificationContext";
import routes from "../routes";
import { usePendingRecommendations } from "../hooks/usePendingRecommendations";
import NavBar from "../shared-components/NavBar";
import apiFetch from "../services/apiFetch";
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
    refreshRecs,
  } = usePendingRecommendations();

  const [processingId, setProcessingId] = useState(null);
  const { isDarkMode } = useTheme();
  const { setPendingRecommendationCount } = useNotifications();

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRec, setEditingRec] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
    rating: 1,
    isPrivate: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const categories = [
    "Movies",
    "TV Shows",
    "Books",
    "Video Games",
    "Podcasts",
    "Music",
    "Recipes",
    "YouTube",
    "Restaurants",
    "Better Than All The Rest",
    "Other",
    "Sports",
    "Travel",
    "Apps",
    "Websites",
    "Events",
    "Services",
    "Health",
    "Fitness",
    "Home",
    "Pets",
  ];

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

  const handlePrivacyToggle = async (recId) => {
    try {
      // Find the current recommendation to get its current privacy state
      const currentRec = pendingRecs.find((rec) => rec._id === recId);
      if (!currentRec) return;

      // Update only the isPrivate field
      const res = await apiFetch("PUT", `/api/recommendations/${recId}`, {
        isPrivate: !currentRec.isPrivate, // Toggle the privacy
      });

      if (res.ok) {
        // Refresh pending recommendations to show updated privacy status
        await refreshRecs();
      } else {
        const errorData = await res.json();
        console.error("Privacy toggle error:", errorData);
        alert("Failed to update privacy. Please try again.");
      }
    } catch (error) {
      console.error("Error toggling privacy:", error);
      alert("An error occurred while updating privacy. Please try again.");
    }
  };
  const handleEditClick = (rec) => {
    setEditingRec(rec);
    setEditForm({
      title: rec.title,
      description: rec.description || "",
      category: rec.category,
      rating: rec.rating,
      isPrivate: rec.isPrivate || false,
    });
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!editingRec) return;

    setIsSaving(true);

    try {
      const res = await apiFetch(
        "PUT",
        `/api/recommendations/${editingRec._id}`,
        editForm,
      );

      if (res.ok) {
        // Refresh pending recommendations to show updated data
        await refreshRecs();
        setShowEditModal(false);
        setEditingRec(null);
      } else {
        alert("Failed to save changes. Please try again.");
      }
    } catch (error) {
      console.error("Error updating recommendation:", error);
      alert("An error occurred while saving. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const toTitleCase = (str) => {
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
    );
  };

  return (
    <div
      className={`flex min-h-screen flex-col ${isDarkMode ? "bg-gray-700" : "bg-lightTanGray"}`}
    >
      <NavBar />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
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
            <SwipeableList type={ListType.IOS} className="space-y-6">
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
                  <div className="w-full">
                    {/* Card Preview */}
                    <div className="mx-auto flex max-w-md flex-col overflow-hidden rounded-lg bg-[#f8ede6] shadow-lg">
                      {/* Header section */}
                      <div className="text-darkBlue relative bg-[#f8ede6] px-4 py-6 text-center">
                        <h3 className="font-boldManrope mb-3 text-xl leading-tight font-bold">
                          {toTitleCase(rec.title)}
                        </h3>

                        <div className="flex justify-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={
                                star <= rec.rating
                                  ? "text-cerulean text-2xl"
                                  : "text-2xl text-gray-300"
                              }
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Description section - matches MyRecommendations style */}
                      <div className="relative m-2 flex min-h-[120px] items-center justify-center bg-[#4a6a7d] p-6 text-white">
                        <p className="text-center text-sm leading-relaxed">
                          {rec.description || "No description provided"}
                        </p>
                      </div>
                      {/* Footer section - matches MyRecommendations style */}
                      <div className="flex flex-col items-center justify-center bg-[#f8ede6] px-4 py-3">
                        {/* Top row: Privacy Toggle - Centered */}
                        <div className="mb-2 flex w-full justify-center">
                          <button
                            onClick={() => handlePrivacyToggle(rec._id)}
                            className="flex items-center gap-1.5 transition-colors"
                            aria-label={`Toggle privacy - currently ${rec.isPrivate ? "private" : "public"}`}
                          >
                            <div
                              className={`relative h-3.5 w-8 rounded-full transition-colors ${
                                rec.isPrivate
                                  ? "bg-hotCoralPink"
                                  : "bg-green-500"
                              }`}
                            >
                              <div
                                className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition-transform ${
                                  rec.isPrivate ? "right-0.5" : "left-0.5"
                                }`}
                              />
                            </div>
                            <span
                              className={`text-[9px] font-semibold ${
                                rec.isPrivate
                                  ? "text-hotCoralPink"
                                  : "text-green-600"
                              }`}
                            >
                              {rec.isPrivate ? "Private" : "Public"}
                            </span>
                          </button>
                        </div>

                        {/* Bottom row: Category and Sender */}
                        <div className="mb-3 flex w-full items-center justify-between text-sm text-gray-600">
                          <span className="font-semibold">{rec.category}</span>
                          <span>
                            By{" "}
                            {rec.user?.username?.charAt(0).toUpperCase() +
                              rec.user?.username?.slice(1) || "Unknown"}
                          </span>
                        </div>

                        {/* Desktop buttons */}
                        <div className="hidden gap-2 lg:flex">
                          <button
                            onClick={() => handleAccept(rec._id)}
                            disabled={processingId === rec._id}
                            className="flex-1 rounded border-2 border-transparent bg-green-500 p-3 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-50"
                          >
                            {processingId === rec._id ? (
                              <i className="fa-solid fa-spinner animate-spin"></i>
                            ) : (
                              "Accept"
                            )}
                          </button>

                          <button
                            onClick={() => handleEditClick(rec)}
                            className="bg-laguna hover:bg-lighTeal flex-1 rounded border-2 border-transparent p-3 text-sm font-semibold text-white transition-colors"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleReject(rec._id)}
                            disabled={processingId === rec._id}
                            className="bg-hotCoralPink border-hotCoralPink hover:text-hotCoralPink flex-1 rounded border-2 p-3 text-sm font-semibold text-white transition-colors hover:bg-white disabled:opacity-50"
                          >
                            {processingId === rec._id ? (
                              <i className="fa-solid fa-spinner animate-spin"></i>
                            ) : (
                              "Reject"
                            )}
                          </button>
                        </div>

                        {/* Mobile tap to edit hint */}
                        <button
                          onClick={() => handleEditClick(rec)}
                          className="bg-laguna hover:bg-lighTeal w-full rounded p-3 py-3 text-sm font-semibold text-white transition-colors lg:hidden"
                        >
                          Tap to Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </SwipeableListItem>
              ))}
            </SwipeableList>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      <Dialog
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      >
        <DialogPanel className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            Edit Before Accepting
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                value={editForm.category}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setEditForm((prev) => ({ ...prev, rating: star }))
                    }
                    className={`text-4xl transition-colors ${
                      star <= editForm.rating
                        ? "text-cerulean hover:text-cerulean/80"
                        : "text-gray-300 hover:text-gray-400"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy Toggle */}
            <div className="flex items-center justify-between rounded border border-gray-300 p-3">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={editForm.isPrivate}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      isPrivate: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700">
                  Private
                </span>
              </label>
              <span
                className={`text-sm font-semibold ${editForm.isPrivate ? "text-hotCoralPink" : "text-green-600"}`}
              >
                {editForm.isPrivate ? "Private" : "Public"}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Private recommendations are only visible to you
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                rows="4"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setShowEditModal(false)}
              disabled={isSaving}
              className="flex-1 rounded bg-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-400 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleEditSave}
              disabled={isSaving}
              className="bg-laguna hover:bg-lighTeal flex-1 rounded px-4 py-2 text-white transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <i className="fa-solid fa-spinner mr-2 animate-spin"></i>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </DialogPanel>
      </Dialog>
    </div>
  );
};

export default PendingRecommendations;
