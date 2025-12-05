import { useState, useEffect } from "react";
import apiFetch from "services/apiFetch";
import StarRating from "../StarRating";
import ModalWrapper from "../ModalWrapper";

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
    "Fashion",
    "Art",
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
        onClose(true);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to update recommendation.");
      }
    } catch (error) {
      console.error("Error updating recommendation:", error);
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
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Recommendation"
    >
      {error && (
        <div
          className="font-body text-hotCoralPink mb-4 rounded bg-red-100 p-3"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="edit-title"
            className="font-body block text-sm text-gray-700"
          >
            Title <span className="text-hotCoralPink">*</span>
          </label>
          <input
            id="edit-title"
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

        <div className="mb-4">
          <label
            htmlFor="edit-category"
            className="font-body block text-sm text-gray-700"
          >
            Category
          </label>
          <select
            id="edit-category"
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

        <div className="mb-4">
          <label
            id="edit-rating-label"
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
            idPrefix="edit-star"
            label="edit-rating-label"
            required
          />
          <p className="font-body mt-1 text-xs text-gray-500">
            How much do you recommend this?
          </p>
        </div>

        <div className="mb-6">
          <label
            htmlFor="edit-description"
            className="font-body block text-sm text-gray-700"
          >
            Description
          </label>
          <textarea
            id="edit-description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            className="font-body w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
            rows="4"
            placeholder="Why do you recommend this?"
            aria-required="false"
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
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default RecommendEditModal;
