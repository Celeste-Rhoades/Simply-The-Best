import { useState, useEffect } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { useFriendRecommendations } from "../../hooks/useFriendRecommendations";
import StarRating from "../StarRating";

const RecommendToFriendModal = ({
  isOpen,
  onClose,
  recommendation,
  onRecommend,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
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

  useEffect(() => {
    if (isOpen && recommendation) {
      setFormData({
        title: recommendation.title || "",
        description: recommendation.description || "",
        category: recommendation.category || "",
        rating: recommendation.rating || 1,
        selectedFriendId: "",
      });
      setError("");
    }
  }, [recommendation, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.selectedFriendId) {
      setError("Please select a friend to recommend to");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const recommendationData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      rating: formData.rating,
      existingRecommendationId: recommendation?._id,
    };

    const result = await onRecommend(
      formData.selectedFriendId,
      recommendationData,
    );

    if (result.success) {
      onClose();
      setFormData({
        title: "",
        description: "",
        category: "",
        rating: 1,
        selectedFriendId: "",
      });
    } else {
      setError(result.error);
    }
    setIsSubmitting(false);
  };

  const handleClose = () => {
    onClose();
    setError("");
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <DialogPanel className="w-full max-w-md rounded-lg bg-white p-6">
        <h2 className="font-header mb-4 text-xl">Recommend to Friend</h2>

        <div className="font-body mb-4 rounded bg-blue-50 p-3">
          <p className="text-sm text-gray-600">
            Share this recommendation with one of your friends
          </p>
        </div>

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
          <div className="mb-4">
            <label className="font-body block text-sm text-gray-700">
              Select Friend <span className="text-hotCoralPink">*</span>
            </label>
            {friendsLoading ? (
              <div className="font-body w-full rounded border border-gray-300 p-2 text-gray-500">
                Loading friends...
              </div>
            ) : (
              <select
                value={formData.selectedFriendId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    selectedFriendId: e.target.value,
                  }))
                }
                className="font-body focus:border-darkBlue w-full rounded border border-gray-300 p-2 focus:outline-none"
                required
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

          <div className="mb-4">
            <label className="font-body block text-sm text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="font-body focus:border-darkBlue w-full rounded border border-gray-300 p-2 focus:outline-none"
              required
            />
          </div>

          <div className="mb-4">
            <label className="font-body block text-sm text-gray-700">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
              className="font-body focus:border-darkBlue w-full rounded border border-gray-300 p-2 focus:outline-none"
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label
              id="recommend-rating-label"
              className="font-body mb-2 block text-sm text-gray-700"
            >
              Your Rating <span className="text-hotCoralPink">*</span>
            </label>
            <StarRating
              rating={formData.rating}
              onChange={(star) =>
                setFormData((prev) => ({ ...prev, rating: star }))
              }
              size="large"
              idPrefix="recommend-star"
              label="recommend-rating-label"
              required
            />
            <p className="font-body mt-1 text-xs text-gray-500">
              Rate this recommendation
            </p>
          </div>

          <div className="mb-6">
            <label className="font-body block text-sm text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="font-body focus:border-darkBlue w-full rounded border border-gray-300 p-2 focus:outline-none"
              rows="4"
              placeholder="Add a personal note about why you're recommending this..."
            />
          </div>

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
              className="font-body bg-coral hover:bg-hotCoralPink flex-1 rounded px-4 py-2 text-white transition-colors disabled:opacity-50"
              disabled={isSubmitting || friends.length === 0}
            >
              {isSubmitting ? "Recommending..." : "Send Recommendation"}
            </button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
};

export default RecommendToFriendModal;
