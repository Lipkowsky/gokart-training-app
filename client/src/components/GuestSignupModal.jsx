import React, { useState } from "react";

const GuestSignupModal = ({ open, onClose, onSubmit }) => {
  const [guestName, setGuestName] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    if (!guestName.trim()) return;
    onSubmit(guestName);
    setGuestName("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-6 shadow-xl w-96">
        <h2 className="text-lg font-bold mb-4">Zapisz gościa</h2>

        <input
          type="text"
          placeholder="Imię i nazwisko gościa"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            Anuluj
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
          >
            Zapisz
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestSignupModal;
