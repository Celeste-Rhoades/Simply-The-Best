import { Dialog, DialogPanel } from "@headlessui/react";

const ModalWrapper = ({ isOpen, onClose, title, children }) => {
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
        className="mx-4 flex max-h-[80vh] w-full max-w-md flex-col rounded-lg bg-white p-6"
        aria-labelledby={titleId}
      >
        {title && (
          <h2 id={titleId} className="font-header mb-4 flex-shrink-0 text-xl">
            {title}
          </h2>
        )}
        <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
      </DialogPanel>
    </Dialog>
  );
};

export default ModalWrapper;
