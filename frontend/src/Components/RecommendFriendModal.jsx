import { useState, useEffect } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { useFriendRecommendations } from "../hooks/useFriendRecommendations";

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
  ];

  // Populate form when recommendation changes
  useEffect(() => {
    if (recommendation) {
      setFormData({
        title: recommendation.title || "",
        description: recommendation.description || "",
        category: recommendation.category || "",
        rating: recommendation.rating || 1,
        selectedFriendId: "",
      });
      setError("");
    }
  }, [recommendation]);

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
    };

    const result = await onRecommend(
      formData.selectedFriendId,
      recommendationData,
    );

    if (result.success) {
      onClose();
      // Reset form for next time
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
        <h2 className="mb-4 text-xl font-bold">Recommend to Friend</h2>

        <div className="mb-4 rounded bg-blue-50 p-3">
          <p className="text-sm text-gray-600">
            Share this recommendation with one of your friends
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        {friendsError && (
          <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
            {friendsError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Select Friend <span className="text-red-500">*</span>
            </label>
            {friendsLoading ? (
              <div className="w-full rounded border border-gray-300 p-2 text-gray-500">
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
                className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
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
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
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
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Your Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, rating: star }))
                  }
                  className={`text-3xl transition-colors ${
                    star <= formData.rating
                      ? "text-yellow-400 hover:text-yellow-500"
                      : "text-gray-300 hover:text-gray-400"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Rate this recommendation
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">
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
              className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              rows="4"
              placeholder="Add a personal note about why you're recommending this..."
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded bg-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-400"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
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
