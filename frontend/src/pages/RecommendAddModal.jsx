import { useState } from "react";
import { CATEGORY_OPTIONS } from "../services/category";

const RecommendAddModal = (props) => {
  const { onClose } = props;
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    rating: "",
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
        setForm({ title: "", category: "", description: "", rating: 1 });
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-opacity-40 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <form onSubmit={handleSubmit}>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full rounded border p-2"
          required
        />
        <select
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
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full rounded border p-2"
          required
        />
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
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className="bg-cerulean rounded px-4 py-2 text-white"
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
    </div>
  );
};

export default RecommendAddModal;
