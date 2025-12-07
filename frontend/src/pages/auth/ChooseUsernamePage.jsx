import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../App";
import FormContainer from "./FormContainer";
import apiFetch from "../../services/apiFetch";
import routes from "../../routes";

const ChooseUsernamePage = () => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(AppContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (username.length < 4) {
      setError("Username must be at least 4 characters");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await apiFetch("POST", "/api/auth/choose-username", {
        username,
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        navigate(routes.recommendations);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to set username");
      }
    } catch (err) {
      console.error("Error setting username:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-raleway flex min-h-screen items-center justify-center">
      <FormContainer>
        <h2 className="font-header mb-6 text-center text-2xl text-gray-800">
          Choose Your Username
        </h2>

        <p className="font-body mb-6 text-center text-sm text-gray-600">
          Pick a unique username for your account
        </p>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="username" className="font-body mb-2 block text-sm">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="font-body w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              placeholder="Enter username"
              required
              minLength={4}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="font-body bg-coral hover:bg-hotCoralPink w-full rounded px-4 py-2 text-white transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Setting username..." : "Continue"}
          </button>
        </form>
      </FormContainer>
    </div>
  );
};

export default ChooseUsernamePage;
