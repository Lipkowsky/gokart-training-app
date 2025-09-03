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
  onDeleteSignup,
  isSelected,
  onSelect,
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

  // określamy czy trening jest już "zakończony"
  const now = new Date();
  // tutaj sprawdzamy startTime < teraz (czyli trening rozpoczął się/ jest w przeszłości)
  const isFinished = training.startTime
    ? new Date(training.endTime) < now
    : false;

  // button disabled jeśli: już zapisany / brak miejsc / trwa zapisywanie / trening zakończony
  const isDisabled =
    signedUp || freeSpots === 0 || signupLoading.has(training.id) || isFinished;

  return (
    <div className="relative">
      <div
        className={`bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow p-5 flex flex-col gap-4
        ${isFinished ? "grayscale opacity-90" : ""}`}
      >
        {/* Górny pasek */}
        <div className="flex justify-between items-start">
          <h2
            className="font-semibold text-lg text-gray-900 max-w-[70%] select-text"
            title={training.title}
          >
            {training.title}
          </h2>
          <div className="flex justify-center items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              className="w-4 h-4 accent-blue-500"
            />
            <span className="flex items-center gap-1 text-sm bg-slate-100 px-2 py-1 rounded-lg">
              <BsPersonCheck className="text-slate-700" />
              {confirmedSignups.length} / {training.maxParticipants}
            </span>
          </div>
        </div>

        {/* Daty */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <span className="block font-semibold">Start:</span>
            <span className="select-text">
              {formatDate(training.startTime)}
            </span>
          </div>
          <div>
            <span className="block font-semibold">Koniec:</span>
            <span className="select-text">{formatDate(training.endTime)}</span>
          </div>
          <div>
            <span className="block font-semibold">Zapisy od:</span>
            <span className="select-text">{formatDate(training.openAt)}</span>
          </div>
        </div>

        {/* Opis */}
        <div className="text-sm text-gray-600 line-clamp-3">
          <Tippy content={training.description}>
            <p className="text-sm text-gray-600 line-clamp-3 cursor-help select-text">
              {training.description}
            </p>
          </Tippy>
        </div>

        {/* Uczestnicy */}
        <div className="space-y-2 flex flex-col text-xs">
          <div>
            <span className="font-medium text-green-600">Potwierdzeni:</span>
            {confirmedSignups.map((s, i) => (
              <li key={i} className="flex justify-between items-center">
                <span>{s.user?.name || s.user?.email}</span>
                {!isFinished && (user?.id === s.userId || isAdmin(user)) && (
                  <button
                    onClick={() =>
                      onDeleteSignup({
                        trainingId: training.id,
                        signupId: s.id,
                      })
                    }
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Usuń
                  </button>
                )}
              </li>
            ))}
          </div>

          <div>
            <span className="font-medium text-yellow-600">Oczekujący:</span>
            {pendingSignups.length > 0 ? (
              <ol className="list-decimal list-inside space-y-1">
                {pendingSignups.map((s, i) => (
                  <li key={i} className="flex justify-between items-center">
                    <span>{s.user?.name || s.user?.email}</span>
                    {!isFinished &&
                      (user?.id === s.userId || isAdmin(user)) && (
                        <button
                          onClick={() =>
                            onDeleteSignup({
                              trainingId: training.id,
                              signupId: s.id,
                            })
                          }
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Usuń
                        </button>
                      )}
                  </li>
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
            {isFinished
              ? "Trening zakończony"
              : mySignup
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

      {/* Nakładka tylko wizualna — półprzezroczysta, blur; pointer-events-none aby umożliwić zaznaczanie tekstu.
          Nakładka pojawia się tylko gdy isFinished jest true. */}
      {isFinished && (
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl pointer-events-none bg-white/50"
        />
      )}
    </div>
  );
};

export default TrainingItem;
