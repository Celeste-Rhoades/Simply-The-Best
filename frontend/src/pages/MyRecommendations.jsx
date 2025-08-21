import { useState, useEffect } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";

import apiFetch from "services/apiFetch";
import NavBar from "shared-components/NavBar";
import RecommendAddModal from "./RecommendAddModal";

const MyRecommendations = () => {
  const [showForm, setShowForm] = useState(false);
  const [showRec, setShowRec] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState("");

  const fetchGroupRecs = async () => {
    setErrors("");
    try {
      const res = await apiFetch("GET", "/api/recommendations/grouped");
      if (res.ok) {
        const data = await res.json();
        setShowRec(data.data);
      } else {
        setErrors("Failed to fetch recommendations.");
      }
    } catch (error) {
      setErrors("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchGroupRecs();
  }, []);

  return (
    <div className="bg-lightTanGray h-screen">
      <NavBar />
      <div className="mx-8 mt-4 flex justify-end">
        <button
          className="bg-darkBlue rounded-md px-4 py-2 text-white shadow-lg"
          onClick={() => setShowForm(true)}
        >
          Add recommendation
        </button>
        <Dialog
          open={showForm}
          onClose={() => setShowForm(false)}
          transition
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition duration-300 data-closed:opacity-0"
        >
          <DialogPanel
            transition
            className="w-full max-w-md transition duration-300 data-closed:scale-75 data-closed:opacity-0"
          >
            <RecommendAddModal onClose={() => setShowForm(false)} />
          </DialogPanel>
        </Dialog>
      </div>
    </div>
  );
};

export default MyRecommendations;
