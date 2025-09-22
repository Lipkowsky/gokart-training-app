import React, { useState } from "react";
import { BsPersonCheck } from "react-icons/bs";
import { formatDate } from "../utils/formatDate";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { isAdmin } from "../utils/isAdmin";
import GuestSignupModal from "./GuestSignupModal";
import axios from "axios";
import toast from "react-hot-toast";
import { useTrainingCopyStore } from "../store/useTrainingCopyStore";
import { useNavigate } from "react-router-dom";
import { FaRegCopy, FaTrash } from "react-icons/fa";
import { useIsOpen } from "../hooks/useIsOpen";

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
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const isOpen = useIsOpen(training.openAt);
  const signups = training.signups || [];
  const confirmedSignups = signups.filter((s) => s.status === "confirmed");
  const pendingSignups = signups.filter((s) => s.status === "pending");

  const freeSpots =
    training.maxParticipants -
    (confirmedSignups.length + pendingSignups.length);

  const mySignup = signups.find((s) => s.userId === user?.id);
  const myGuestSignups = signups.filter(
    (s) => s.createdById === user?.id && !s.userId
  );

  const now = new Date();
  const isFinished = training.endTime
    ? new Date(training.endTime) < now
    : false;

  const canSignup =
    !mySignup &&
    freeSpots > 0 &&
    !signupLoading.has(training.id) &&
    !isFinished &&
    isOpen;

  const { setCopiedTraining } = useTrainingCopyStore();
  const navigate = useNavigate();

  const handleCopy = () => {
    setCopiedTraining({
      title: training.title,
      startTime: new Date(training.startTime),
      endTime: new Date(training.endTime),
      openAt: new Date(training.openAt),
      maxParticipants: training.maxParticipants,
      description: training.description,
    });

    navigate("/addTraining");
  };

  const handleSignupGuest = async (guestName) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE}/api/trainings/${training.id}/signup`,
        { guestName },
        { withCredentials: true }
      );
      toast.success("Gość zapisany!");
      setGuestModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Błąd przy zapisie gościa");
    }
  };

  const renderSignup = (s) => {
    const isGuest = !s.userId;
    const displayName = s.user?.name || s.user?.email || s.guestName;
    const guestOwnerName =
      s.createdBy?.name || s.createdBy?.email || "Nieznany";

    return (
      <li key={s.id} className="flex justify-between items-center">
        <span>
          {isGuest
            ? `Gość: ${displayName} (dodany przez ${guestOwnerName})`
            : displayName}
        </span>
        {!isFinished &&
          (s.userId === user?.id ||
            s.createdById === user?.id ||
            isAdmin(user)) && (
            <button
              onClick={() =>
                onDeleteSignup({ trainingId: training.id, signupId: s.id })
              }
              className="text-red-500 hover:text-red-700 text-xs"
            >
              Usuń
            </button>
          )}
      </li>
    );
  };

  return (
    <div className="relative">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow p-5 flex flex-col gap-4">
        <div
          className={`${
            isFinished ? "grayscale opacity-90" : ""
          } flex flex-col gap-4`}
        >
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
              <span className="select-text">
                {formatDate(training.endTime)}
              </span>
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
              {confirmedSignups.length > 0 ? (
                <ol className="list-decimal list-inside space-y-1">
                  {confirmedSignups.map(renderSignup)}
                </ol>
              ) : (
                <p>Brak</p>
              )}
            </div>
            <div>
              <span className="font-medium text-yellow-600">Oczekujący:</span>
              {pendingSignups.length > 0 ? (
                <ol className="list-decimal list-inside space-y-1">
                  {pendingSignups.map(renderSignup)}
                </ol>
              ) : (
                <p>Brak</p>
              )}
            </div>
          </div>
        </div>

        {/* Przyciski – zawsze kolorowe */}
        <div className="flex gap-2 text-xs justify-end mt-auto flex-wrap relative z-10">
          {/* Przycisk dla siebie */}
          <button
            onClick={() => onSignup(training)}
            disabled={!canSignup}
            className={`px-4 py-2 rounded-lg font-semibold shadow-sm transition ${
              !canSignup
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

          {user && (
            <button
              onClick={() => setGuestModalOpen(true)}
              disabled={isFinished || freeSpots === 0 || !isOpen}
              className={`px-4 py-2 rounded-lg font-semibold shadow-sm transition ${
                isFinished || freeSpots === 0 || !isOpen
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              Zapisz gościa
            </button>
          )}

          {user && isAdmin(user) && (
            <Tippy content="Kopiuj trening">
              <button
                onClick={handleCopy}
                className="px-3 py-2 rounded-lg bg-slate-500 hover:bg-slate-600 text-white font-semibold shadow-sm transition"
              >
                <FaRegCopy />
              </button>
            </Tippy>
          )}

          {/* Usuń */}
          {user && isAdmin(user) && (
            <Tippy content="Usuń trening">
              <button
                onClick={() => onDelete(training.id)}
                className="px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold shadow-sm transition"
              >
                <FaTrash />
              </button>
            </Tippy>
          )}
        </div>
      </div>

      {/* Nakładka przy zakończonym */}
      {isFinished && (
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl bg-white/70 pointer-events-none z-0"
        />
      )}

      {/* Modal dla gościa */}
      <GuestSignupModal
        open={guestModalOpen}
        onClose={() => setGuestModalOpen(false)}
        onSubmit={handleSignupGuest}
      />
    </div>
  );
};

export default TrainingItem;
