import { useState, useEffect } from "react";
import StarRating from "../StarRating";
import ModalWrapper from "../ModalWrapper";

const CopyRecommendationModal = ({ isOpen, onClose, originalRec, onCopy }) => {
  const [formData, setFormData] = useState({
    title: originalRec?.title || "",
    description: originalRec?.description || "",
    category: originalRec?.category || "",
    rating: originalRec?.rating || 1,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const result = await onCopy(originalRec._id, formData);

    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
    setIsSubmitting(false);
  };

  const getOriginalRecommender = () => {
    if (originalRec?.originalRecommendedBy) {
      return originalRec.originalRecommendedBy.username;
    }
    return originalRec?.user?.username;
  };

  useEffect(() => {
    console.log("originalRec changed:", originalRec);
    if (originalRec) {
      setFormData({
        title: originalRec.title || "",
        description: originalRec.description || "",
        category: originalRec.category || "",
        rating: 1,
      });
    }
  }, [originalRec]);

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Add to My Recommendations"
    >
      <div className="font-body mb-4 rounded bg-blue-50 p-3">
        <p className="text-sm text-gray-600">
          Originally recommended by:{" "}
          <span className="font-semibold">{getOriginalRecommender()}</span>
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

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="copy-title" className="font-body block text-sm">
            Title
          </label>
          <input
            id="copy-title"
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="font-body w-full rounded border p-2"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="copy-category" className="font-body block text-sm">
            Category
          </label>
          <select
            id="copy-category"
            value={formData.category}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, category: e.target.value }))
            }
            className="font-body w-full rounded border p-2"
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
          <label id="copy-rating-label" className="font-body block text-sm">
            Rating
          </label>
          <StarRating
            rating={formData.rating}
            onChange={(star) =>
              setFormData((prev) => ({ ...prev, rating: star }))
            }
            size="large"
            idPrefix="copy-star"
            label="copy-rating-label"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="copy-description" className="font-body block text-sm">
            Description
          </label>
          <textarea
            id="copy-description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            className="font-body w-full rounded border p-2"
            rows="3"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="font-body flex-1 rounded bg-gray-300 px-4 py-2 text-white hover:bg-gray-400"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="font-body bg-coral hover:bg-hotCoralPink flex-1 rounded px-4 py-2 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add to My List"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default CopyRecommendationModal;
