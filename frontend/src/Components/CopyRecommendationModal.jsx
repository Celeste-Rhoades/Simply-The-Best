import { useState, useEffect } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";

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
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <DialogPanel className="w-full max-w-md rounded-lg bg-white p-6">
        <h2 className="font-header mb-4 text-xl">Add to My Recommendations</h2>

        <div className="font-body mb-4 rounded bg-blue-50 p-3">
          <p className="text-sm text-gray-600">
            Originally recommended by:{" "}
            <span className="font-semibold">{getOriginalRecommender()}</span>
          </p>
        </div>

        {error && (
          <div className="font-body text-hotCoralPink mb-4 rounded bg-red-100 p-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="font-body block text-sm">Title</label>
            <input
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
            <label className="font-body block text-sm">Category</label>
            <select
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
            <label className="font-body block text-sm">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, rating: star }))
                  }
                  className={`text-2xl ${star <= formData.rating ? "text-cerulean" : "text-gray-300"}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="font-body block text-sm">Description</label>
            <textarea
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
              className="font-body flex-1 rounded bg-gray-300 px-4 py-2"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="font-body flex-1 rounded bg-blue-500 px-4 py-2 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add to My List"}
            </button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
};

export default CopyRecommendationModal;
