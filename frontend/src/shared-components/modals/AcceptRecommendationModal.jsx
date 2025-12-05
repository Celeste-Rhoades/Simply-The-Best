import { useState, useEffect } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";

const AcceptRecommendationModal = ({
  isOpen,
  onClose,
  recommendation,
  onAccept,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    rating: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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
        rating: 1, // Start with 1 star for user to set their own rating
      });
      setError(""); // Clear any previous errors
    }
  }, [recommendation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const result = await onAccept(recommendation._id, formData);

    if (result.success) {
      onClose();
      // Reset form for next time
      setFormData({
        title: "",
        description: "",
        category: "",
        rating: 1,
      });
    } else {
      setError(result.error);
    }
    setIsSubmitting(false);
  };

  const handleClose = () => {
    onClose();
    setError(""); // Clear errors when closing
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <DialogPanel className="w-full max-w-md rounded-lg bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">Accept Recommendation</h2>

        <div className="mb-4 rounded bg-blue-50 p-3">
          <p className="text-sm text-gray-600">
            Recommended by:{" "}
            <span className="font-semibold">
              {recommendation?.user?.username}
            </span>
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
              className="focus:border-darkBlue w-full rounded border border-gray-300 p-2 focus:outline-none"
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
              className="focus:border-darkBlue w-full rounded border border-gray-300 p-2 focus:outline-none"
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
              Rate this recommendation based on your experience
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
              className="focus:border-darkBlue w-full rounded border border-gray-300 p-2 focus:outline-none"
              rows="4"
              placeholder="You can edit the description or add your own thoughts..."
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
              className="flex-1 rounded bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Accepting..." : "Accept & Add"}
            </button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
};

export default AcceptRecommendationModal;
