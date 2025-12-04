import { useState, useEffect } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { useFriendRecommendations } from "../hooks/useFriendRecommendations";

const CreateAndShareModal = ({ isOpen, onClose, onCreateAndShare }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Movies",
    rating: 1,
    selectedFriendId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    friends,
    isLoading: friendsLoading,
    error: friendsError,
  } = useFriendRecommendations();

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
    "Fashion",
    "Art",
  ];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        description: "",
        category: "Movies",
        rating: 1,
        selectedFriendId: "",
      });
      setError("");
    }
  }, [isOpen]);

  // Handle keyboard navigation for star rating
  const handleStarKeyDown = (e, star) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      setFormData((prev) => ({ ...prev, rating: star }));
    } else if (e.key === "ArrowRight" && star < 5) {
      e.preventDefault();
      document.getElementById(`create-star-${star + 1}`)?.focus();
    } else if (e.key === "ArrowLeft" && star > 1) {
      e.preventDefault();
      document.getElementById(`create-star-${star - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.selectedFriendId) {
      setError("Please select a friend to share with");
      return;
    }

    if (!formData.title.trim()) {
      setError("Please enter a title");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const recommendationData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      rating: formData.rating,
    };

    const result = await onCreateAndShare(
      formData.selectedFriendId,
      recommendationData,
    );

    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
    setIsSubmitting(false);
  };

  const handleClose = () => {
    onClose();
    setError("");
  };

  const selectedFriend = friends.find(
    (friend) => friend._id === formData.selectedFriendId,
  );

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <DialogPanel
        className="w-full max-w-md rounded-lg bg-white p-6"
        aria-labelledby="create-share-title"
      >
        {/* Modal heading */}
        <h2 id="create-share-title" className="font-header mb-4 text-xl">
          Create & Share Recommendation
        </h2>

        <div className="font-body mb-4 rounded bg-green-50 p-3">
          <p className="text-sm text-gray-600">
            Create a new recommendation and share it directly with a friend
          </p>
        </div>

        {/* Error display with screen reader announcement */}
        {error && (
          <div
            className="font-body text-hotCoralPink mb-4 rounded bg-red-100 p-3"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        {friendsError && (
          <div
            className="font-body text-hotCoralPink mb-4 rounded bg-red-100 p-3"
            role="alert"
          >
            {friendsError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Friend selector */}
          <div className="mb-4">
            <label
              htmlFor="create-friend"
              className="font-body block text-sm text-gray-700"
            >
              Share with Friend <span className="text-hotCoralPink">*</span>
            </label>
            {friendsLoading ? (
              <div className="font-body w-full rounded border border-gray-300 p-2 text-gray-500">
                Loading friends...
              </div>
            ) : (
              <select
                id="create-friend"
                value={formData.selectedFriendId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    selectedFriendId: e.target.value,
                  }))
                }
                className="font-body w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                required
                aria-required="true"
              >
                <option value="">Choose a friend...</option>
                {friends.map((friend) => (
                  <option key={friend._id} value={friend._id}>
                    {friend.username}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Title input */}
          <div className="mb-4">
            <label
              htmlFor="create-title"
              className="font-body block text-sm text-gray-700"
            >
              Title <span className="text-hotCoralPink">*</span>
            </label>
            <input
              id="create-title"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="font-body w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              placeholder="What are you recommending?"
              required
              aria-required="true"
            />
          </div>

          {/* Category selector */}
          <div className="mb-4">
            <label
              htmlFor="create-category"
              className="font-body block text-sm text-gray-700"
            >
              Category
            </label>
            <select
              id="create-category"
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
              className="font-body w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              required
              aria-required="true"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Star rating with keyboard support */}
          <div className="mb-4">
            <label
              id="create-rating-label"
              className="font-body mb-2 block text-sm text-gray-700"
            >
              Your Rating <span className="text-hotCoralPink">*</span>
            </label>
            <div
              className="flex gap-1"
              role="radiogroup"
              aria-labelledby="create-rating-label"
              aria-required="true"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  id={`create-star-${star}`}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, rating: star }))
                  }
                  onKeyDown={(e) => handleStarKeyDown(e, star)}
                  className={`focus:ring-cerulean text-3xl transition-colors focus:ring-2 focus:ring-offset-1 focus:outline-none ${
                    star <= formData.rating
                      ? "text-cerulean hover:text-[#0a8aa3]"
                      : "text-gray-300 hover:text-gray-400"
                  }`}
                  role="radio"
                  aria-checked={formData.rating === star}
                  aria-label={`Rate ${star} out of 5 stars`}
                  tabIndex={formData.rating === star ? 0 : -1}
                >
                  <span aria-hidden="true">★</span>
                </button>
              ))}
            </div>
            <p className="font-body mt-1 text-xs text-gray-500">
              How much do you recommend this?
            </p>
          </div>

          {/* Description textarea */}
          <div className="mb-6">
            <label
              htmlFor="create-description"
              className="font-body block text-sm text-gray-700"
            >
              Description
            </label>
            <textarea
              id="create-description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="font-body w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              rows="4"
              placeholder="Tell your friend why you recommend this..."
              aria-required="false"
            />
          </div>

          {/* Form buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="font-body flex-1 rounded bg-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-400"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="font-body flex-1 rounded bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600 disabled:opacity-50"
              disabled={isSubmitting || friends.length === 0}
              aria-busy={isSubmitting}
            >
              {isSubmitting
                ? "Sharing..."
                : selectedFriend
                  ? `Share with ${selectedFriend.username}`
                  : "Share Recommendation"}
            </button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
};

export default CreateAndShareModal;
