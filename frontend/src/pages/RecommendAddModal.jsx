import { useState } from "react";
import { CATEGORY_OPTIONS } from "../services/category";
import apiFetch from "../services/apiFetch";

const RecommendAddModal = ({ onClose }) => {
  const [form, setForm] = useState({
    title: "",
    rating: "",
    description: "",
    category: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "rating" ? Number(value) : value,
    }));
  };

  const handleStarClick = (star) => {
    setForm((prev) => ({
      ...prev,
      rating: star,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.rating || form.rating < 1 || form.rating > 5)
      newErrors.rating = "Rating must be between 1 and 5";
    if (!form.category.trim()) newErrors.category = "Please select category";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitError("");
    setLoading(true);
    setSuccess(false);
    try {
      const res = await apiFetch("POST", "/api/recommendations", form);
      if (res.ok) {
        setSuccess(true);
        setForm({ title: "", rating: "", description: "", category: "" });
        setErrors({});
        setTimeout(() => onClose(), 1500); // Auto-close modal after 1.5s
      } else {
        setSubmitError("Failed to save recommendation. Please try again.");
      }
    } catch (err) {
      setSubmitError("Failed to save recommendation. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded bg-white p-6 shadow"
    >
      {/* Title */}
      <div>
        <label htmlFor="title" className="mb-1 block font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full rounded border p-2"
          required
          data-autofocus
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title}</p>
        )}
      </div>

      {/* Rating */}
      <div>
        <label className="mb-1 block font-medium">Rating</label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => handleStarClick(star)}
              className="focus:outline-none"
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              <span
                className={
                  star <= form.rating
                    ? "text-2xl text-yellow-400"
                    : "text-2xl text-gray-300"
                }
              >
                ★
              </span>
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="mt-1 text-sm text-red-500">{errors.rating}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="mb-1 block font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full rounded border p-2"
        />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="mb-1 block font-medium">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full rounded border p-2"
          required
        >
          <option value="">Select Category</option>
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-500">{errors.category}</p>
        )}
      </div>

      {/* API error message */}
      {submitError && (
        <div className="mb-2 rounded bg-red-100 px-3 py-2 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={loading}
          className="bg-darkBlue rounded px-4 py-2 text-white"
        >
          {loading ? "Submitting..." : "Add Recommendation"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded bg-gray-300 px-4 py-2 text-gray-700"
        >
          Cancel
        </button>
      </div>
      {success && (
        <div className="mt-2 text-green-600">Recommendation added!</div>
      )}
    </form>
  );
};

export default RecommendAddModal;
