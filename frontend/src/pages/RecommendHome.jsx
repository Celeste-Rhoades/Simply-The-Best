import { useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";

import NavBar from "shared-components/NavBar";
import RecommendAddModal from "./RecommendAddModal";

const RecommendHome = () => {
  const [showForm, setShowForm] = useState(false);
  return (
    <div className="bg-lightTanGray">
      <NavBar />
      <div className="mx-8 mt-4 flex justify-end">
        <button
          className="bg-perfectTeal rounded-md px-4 py-2 text-white shadow-lg"
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
      <div className="bg-cerulean mx-8 mt-12">I am a box</div>
    </div>
  );
};

export default RecommendHome;
