import { useState, useEffect } from "react";
import apiFetch from "../services/apiFetch";

const PendingRecommendations = () => {
  const [pendingRecs, setPendingRecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPendingRecommendations = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("GET", "/api/recommendations/pending");
      if (res.ok) {
        const data = await res.json();
        setPendingRecs(data.data);
      } else {
        setError("Failed to fetch pending recommendations");
      }
    } catch (err) {
      setError("Network error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRecommendations();
  }, []);

  const handleApprove = async (recommendationId) => {
    try {
      const res = await apiFetch(
        "PUT",
        `/api/recommendations/${recommendationId}/approve`,
      );
      if (res.ok) {
        // Remove from pending list
        setPendingRecs((prev) =>
          prev.filter((rec) => rec._id !== recommendationId),
        );
      }
    } catch (error) {
      console.log("Error approving:", error);
    }
  };

  const handleReject = async (recommendationId) => {
    try {
      const res = await apiFetch(
        "PUT",
        `/api/recommendations/${recommendationId}/reject`,
      );
      if (res.ok) {
        // Remove from pending list
        setPendingRecs((prev) =>
          prev.filter((rec) => rec._id !== recommendationId),
        );
      }
    } catch (error) {
      console.log("Error rejecting:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Pending Recommendations</h1>
      {loading ? (
        <p>Loading pending recommendations...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : pendingRecs.length === 0 ? (
        <p>No pending recommendations</p>
      ) : (
        <div className="space-y-4">
          {pendingRecs.map((rec) => (
            <div
              key={rec._id}
              className="rounded-lg border bg-white p-4 shadow"
            >
              <h3 className="text-lg font-bold">{rec.title}</h3>
              <p className="mb-2 text-gray-600">{rec.description}</p>
              <p className="mb-4 text-sm text-gray-500">
                Recommended by: {rec.user?.username}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(rec._id)}
                  className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(rec._id)}
                  className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingRecommendations;
