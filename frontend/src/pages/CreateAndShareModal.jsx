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
      // Form will reset when modal reopens due to useEffect
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
      <DialogPanel className="w-full max-w-md rounded-lg bg-white p-6">
        <h2 className="font-header mb-4 text-xl">
          Create & Share Recommendation
        </h2>

        <div className="font-body mb-4 rounded bg-green-50 p-3">
          <p className="text-sm text-gray-600">
            Create a new recommendation and share it directly with a friend
          </p>
        </div>

        {error && (
          <div className="font-body text-hotCoralPink mb-4 rounded bg-red-100 p-3">
            {error}
          </div>
        )}

        {friendsError && (
          <div className="font-body text-hotCoralPink mb-4 rounded bg-red-100 p-3">
            {friendsError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="font-body block text-sm text-gray-700">
              Share with Friend <span className="text-hotCoralPink">*</span>
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
                className="font-body w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
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
              Title <span className="text-hotCoralPink">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="font-body w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              placeholder="What are you recommending?"
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
              className="font-body w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
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
            <label className="font-body mb-2 block text-sm text-gray-700">
              Your Rating <span className="text-hotCoralPink">*</span>
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
                      ? "text-cerulean hover:text-[#0a8aa3]"
                      : "text-gray-300 hover:text-gray-400"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="font-body mt-1 text-xs text-gray-500">
              How much do you recommend this?
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
              className="font-body w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              rows="4"
              placeholder="Tell your friend why you recommend this..."
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
              className="font-body flex-1 rounded bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600 disabled:opacity-50"
              disabled={isSubmitting || friends.length === 0}
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
