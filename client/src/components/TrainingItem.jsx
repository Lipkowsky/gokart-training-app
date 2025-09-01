import React from "react";
import { BsPersonCheck } from "react-icons/bs";
import { formatDate } from "../utils/formatDate";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css"; // domyślne style
import { isAdmin } from "../utils/isAdmin";

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
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow p-5 flex flex-col gap-4">
      {/* Górny pasek */}
      <div className="flex justify-between items-start">
        <h2
          className="font-semibold text-lg text-gray-900 max-w-[70%]"
          title={training.title}
        >
          {training.title}
        </h2>
        <span className="flex items-center gap-1 text-sm bg-slate-100 px-2 py-1 rounded-lg">
          <BsPersonCheck className="text-slate-700" />
          {confirmedSignups.length} / {training.maxParticipants}
        </span>
      </div>

      {/* Daty */}
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div>
          <span className="block font-semibold">Start:</span>
          <span>{formatDate(training.startTime)}</span>
        </div>
        <div>
          <span className="block font-semibold">Koniec:</span>
          <span>{formatDate(training.endTime)}</span>
        </div>
        <div>
          <span className="block font-semibold">Zapisy od:</span>
          <span>{formatDate(training.openAt)}</span>
        </div>
      </div>

      {/* Opis */}
      <p className="text-sm text-gray-600 line-clamp-3">
        <Tippy content={training.description}>
          <p className="text-sm text-gray-600 line-clamp-3 cursor-help">
            {training.description}
          </p>
        </Tippy>
      </p>

      {/* Uczestnicy */}
      <div className="space-y-2 flex flex-col text-xs">
        <div>
          <span className="font-medium text-green-600">Potwierdzeni:</span>
          {confirmedSignups.length > 0 ? (
            <ol className="list-decimal list-inside space-y-1">
              {confirmedSignups.map((s, i) => (
                <li key={i}>{s.user?.name || s.user.email}</li>
              ))}
            </ol>
          ) : (
            <p>Brak</p>
          )}
        </div>

        <div>
          <span className="font-medium text-yellow-600">Oczekujący:</span>
          {pendingSignups.length > 0 ? (
            <ol className="list-decimal list-inside space-y-1">
              {pendingSignups.map((s, i) => (
                <li key={i}>{s.user?.name || s.user.email}</li>
              ))}
            </ol>
          ) : (
            <p>Brak</p>
          )}
        </div>
      </div>

      {/* Przyciski */}
      <div className="flex gap-2 text-xs justify-end mt-auto">
        <button
          onClick={() => onSignup(training)}
          disabled={isDisabled}
          className={`px-4 py-2 rounded-lg font-semibold shadow-sm transition ${
            isDisabled
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 text-white"
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

        {user && isAdmin(user) && (
          <button
            onClick={() => onDelete(training.id)}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold shadow-sm transition"
          >
            Usuń
          </button>
        )}
      </div>
    </div>
  );
};

export default TrainingItem;
