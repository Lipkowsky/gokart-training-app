import { useEffect } from "react";
import { createPortal } from "react-dom";

const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  message,
  confirmText,
  confirmButtonClass = "bg-blue-500 hover:bg-blue-600 text-white",
  cancelButtonClass = "bg-gray-200 hover:bg-gray-300 text-gray-800"
}) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-gray-200 opacity-80"
        onClick={onClose}
      ></div>

      {/* modal */}
      <div className="relative bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full">
        <h2 className="text-lg font-bold mb-4 text-gray-800">Potwierdzenie</h2>
        <p className="mb-6 text-gray-700">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className={`${cancelButtonClass} px-4 py-2 rounded`}
          >
            Anuluj
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`${confirmButtonClass} px-5 py-2 rounded`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
