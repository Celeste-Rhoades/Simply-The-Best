import { useState } from "react";
import NavBar from "shared-components/NavBar";
import RecommendAddModal from "./RecommendAddModal";

const MyRecommendations = () => {
  const [showForm, setShowForm] = useState(false);
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
        {showForm && (
          <div className="bg-opacity-40 fixed inset-0 z-50 flex items-center justify-center bg-black">
            <RecommendAddModal onClose={() => setShowForm(false)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRecommendations;
