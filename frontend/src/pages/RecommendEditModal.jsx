import { useState, useEffect } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import apiFetch from "services/apiFetch";

const RecommendEditModal = ({ isOpen, onClose, recommendation }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Movies",
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
        category: recommendation.category || "Movies",
        rating: recommendation.rating || 1,
      });
      setError("");
    }
  }, [recommendation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Please enter a title");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await apiFetch(
        "PUT",
        `/api/recommendations/${recommendation._id}`,
        {
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          rating: formData.rating,
        },
      );

      if (res.ok) {
        onClose(true); // true indicates success
      } else {
        const data = await res.json();
        setError(data.message || "Failed to update recommendation.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose(false);
    setError("");
  };

  if (!recommendation) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <DialogPanel className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">Edit Recommendation</h2>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              placeholder="What are you recommending?"
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
              How much do you recommend this?
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
              placeholder="Why do you recommend this?"
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
              className="bg-coral hover:bg-hotCoralPink flex-1 rounded px-4 py-2 text-white transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
};

export default RecommendEditModal;
