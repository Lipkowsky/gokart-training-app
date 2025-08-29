import React from "react";
import { BsPersonCheck } from "react-icons/bs";
import { formatDate } from "../utils/formatDate";

const TrainingItem = ({
  training,
  user,
  signupLoading,
  onSignup,
  onDelete,
}) => {
  const signups = training.signups || [];
  const confirmedSignups = signups.filter((s) => s.status === "confirmed");
  const pendingSignups = signups.filter((s) => s.status === "pending");
  const freeSpots =
    training.maxParticipants -
    (confirmedSignups.length + pendingSignups.length);

  const mySignup = signups.find(
    (s) => s.userId === user?.id || s.user?.id === user?.id
  );
  const signedUp = !!mySignup;
  const isDisabled =
    signedUp || freeSpots === 0 || signupLoading.has(training.id);

  return (
<div className="bg-white border border-[#d9d9d9] rounded-xl shadow-lg hover:shadow-xl transition-shadow p-5 flex flex-col justify-between">

      {/* Górny pasek */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-lg text-gray-900">
          {training.title}
        </h2>
        <div className="flex items-center gap-1 text-gray-600 text-sm">
          <BsPersonCheck className="text-blue-500" />
          <span>
            {confirmedSignups.length} / {training.maxParticipants}
          </span>
        </div>
      </div>

      {/* Daty */}
      <div className="bg-gray-100 text-gray-700 text-sm rounded-md px-3 py-1 mb-3">
        {formatDate(training.startTime)} – {formatDate(training.endTime)}
      </div>

      {/* Opis */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-4 text-center">
        {training.description}
      </p>

      {/* Uczestnicy */}
      <div className="text-xs space-y-1 mb-4">
        <p>
          <span className="font-medium text-green-600">Potwierdzeni:</span>{" "}
          {confirmedSignups.map((s) => s.user?.name || "Unknown").join(", ") ||
            "Brak"}
        </p>
        <p>
          <span className="font-medium text-yellow-600">Oczekujący:</span>{" "}
          {pendingSignups.map((s) => s.user?.email || "Unknown").join(", ") ||
            "Brak"}
        </p>
      </div>

      {/* Przyciski */}
      <div className="flex flex-col gap-2 mt-auto">
        <button
          onClick={() => onSignup(training)}
          disabled={isDisabled}
          className={`btn-primary ${
            isDisabled
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "btn-success"
          }`}
        >
          {mySignup
            ? mySignup.status === "pending"
              ? "Oczekuje na potwierdzenie"
              : "Zapisano"
            : freeSpots === 0
            ? "Brak miejsc"
            : signupLoading.has(training.id)
            ? "Zapisywanie..."
            : "Zapisz się"}
        </button>

        <button
          onClick={() => onDelete(training.id)} // tutaj trafi ID do modala
          className="btn-dangerous"
        >
          Usuń trening
        </button>
      </div>
    </div>
  );
};

export default TrainingItem;
