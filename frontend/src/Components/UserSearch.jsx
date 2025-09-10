import { useState, useEffect, useCallback } from "react";
import apiFetch from "services/apiFetch";

const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const handleSearch = useCallback(async () => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      setSearchError("");
      return;
    }

    setIsLoading(true);
    setSearchError("");

    try {
      const res = await apiFetch(
        "GET",
        `/api/users/search?search=${searchTerm}`,
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.data);
      } else {
        setSearchError("Failed to search users");
      }
    } catch (err) {
      setSearchError("Network error. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
        setSearchError("");
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, handleSearch]);

  return (
    <>
      <div className="m-4 flex justify-end p-1">
        <div className="relative">
          <input
            id="user-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for users by username"
            className="m-2 w-66 rounded-xl border border-slate-400 pl-8 shadow"
            aria-label="Search for users"
            name="userSearch"
          />
          <i className="fa-solid fa-magnifying-glass absolute top-1/2 left-4 -translate-y-1/2 transform text-gray-400"></i>
        </div>
        <button className="bg-hotCoralPink rounded-lg px-2 shadow">
          Submit
        </button>
      </div>
    </>
  );
};

export default UserSearch;
