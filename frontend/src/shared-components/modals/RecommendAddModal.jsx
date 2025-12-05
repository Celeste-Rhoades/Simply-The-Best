import { useState } from "react";
import { CATEGORY_OPTIONS } from "../../services/category";
import apiFetch from "../../services/apiFetch";
import StarRating from "../StarRating";

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

      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        setSubmitError("Failed to save recommendation. Please try again.");
        setLoading(false);
        return;
      }

      if (res.ok) {
        setSuccess(true);
        setForm({ title: "", rating: "", description: "", category: "" });
        setErrors({});
        setTimeout(() => onClose(), 1500);
      } else {
        setSubmitError(
          data.message || "Failed to save recommendation. Please try again.",
        );
      }
    } catch (err) {
      console.error("Error submitting recommendation:", err);
      setSubmitError("Failed to save recommendation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded bg-white p-6 shadow"
      aria-labelledby="add-recommendation-title"
    >
      <h2
        id="add-recommendation-title"
        className="font-header mb-4 text-xl text-gray-800"
      >
        Add Recommendation
      </h2>

      <div>
        <label htmlFor="title" className="font-body mb-1 block">
          Title <span className="text-hotCoralPink">*</span>
        </label>
        <input
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="font-body w-full rounded border p-2"
          required
          aria-required="true"
          aria-invalid={errors.title ? "true" : "false"}
          aria-describedby={errors.title ? "title-error" : undefined}
          data-autofocus
        />
        {errors.title && (
          <p
            id="title-error"
            className="font-body text-hotCoralPink mt-1 text-sm"
            role="alert"
          >
            {errors.title}
          </p>
        )}
      </div>

      <div>
        <label id="rating-label" className="font-body mb-1 block">
          Rating <span className="text-hotCoralPink">*</span>
        </label>
        <StarRating
          rating={form.rating}
          onChange={(star) => setForm((prev) => ({ ...prev, rating: star }))}
          size="large"
          idPrefix="star"
          label="rating-label"
          required
        />
        {errors.rating && (
          <p
            id="rating-error"
            className="font-body text-hotCoralPink mt-1 text-sm"
            role="alert"
          >
            {errors.rating}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="font-body mb-1 block">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="font-body w-full rounded border p-2"
          aria-required="false"
        />
      </div>

      <div>
        <label htmlFor="category" className="font-body mb-1 block">
          Category <span className="text-hotCoralPink">*</span>
        </label>
        <select
          id="category"
          name="category"
          value={form.category}
          onChange={handleChange}
          className="font-body w-full rounded border p-2"
          required
          aria-required="true"
          aria-invalid={errors.category ? "true" : "false"}
          aria-describedby={errors.category ? "category-error" : undefined}
        >
          <option value="">Select Category</option>
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p
            id="category-error"
            className="font-body text-hotCoralPink mt-1 text-sm"
            role="alert"
          >
            {errors.category}
          </p>
        )}
      </div>

      {submitError && (
        <div
          className="font-body bg-hotCoralPink mb-2 rounded px-3 py-2 text-sm text-white"
          role="alert"
          aria-live="assertive"
        >
          {submitError}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={loading}
          className="font-body bg-coral hover:bg-hotCoralPink rounded px-4 py-2 text-white disabled:opacity-50"
          aria-busy={loading}
        >
          {loading ? "Submitting..." : "Add Recommendation"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="font-body rounded bg-gray-300 px-4 py-2 text-white hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>

      {success && (
        <div
          className="font-body mt-2 text-green-600"
          role="status"
          aria-live="polite"
        >
          Recommendation added!
        </div>
      )}
    </form>
  );
};

export default RecommendAddModal;
