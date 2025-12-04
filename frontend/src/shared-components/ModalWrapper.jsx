import { Dialog, DialogPanel } from "@headlessui/react";

const ModalWrapper = ({ isOpen, onClose, title, children }) => {
  // Generate unique ID for aria-labelledby if title exists
  const titleId = title
    ? `modal-title-${title.replace(/\s+/g, "-").toLowerCase()}`
    : undefined;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <DialogPanel
        className="mx-4 w-full max-w-md rounded-lg bg-white p-6"
        aria-labelledby={titleId}
      >
        {title && (
          <h2 id={titleId} className="font-header mb-4 text-xl">
            {title}
          </h2>
        )}
        {children}
      </DialogPanel>
    </Dialog>
  );
};

export default ModalWrapper;
