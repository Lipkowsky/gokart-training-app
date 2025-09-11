import React from "react";
import { formatDate } from "../utils/formatDate";
import { useCountdown } from "../hooks/useCountdown";
import { useAuth } from "../auth";

const SignupCard = ({ signup, onConfirm }) => {
  const { user } = useAuth();
  const { hours, minutes, seconds, timeLeft } = useCountdown(signup.expiresAt);

  const STATUS_LABELS = {
    confirmed: "Potwierdzony",
    pending: "Oczekuje potwierdzenia",
    cancelled: "Anulowany",
  };

  const displayName = signup.isGuest
    ? signup.guestName
    : signup.user?.name || signup.user?.email;

  const canConfirm =
    signup.status === "pending" &&
    timeLeft > 0 &&
    (signup.userId === user.id || signup.createdById === user.id);

  return (
    <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-lg p-6 flex flex-col gap-4 transition hover:shadow-xl">
      {/* Nagłówek */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">
            {signup.training.title}
          </h3>
        </div>

        {!signup.isGuest && signup.user && (
          <div className="flex items-center gap-2">
            <img
              src={signup.user.avatarUrl}
              alt={displayName}
              className="w-9 h-9 rounded-full border object-cover"
            />
            <span className="text-sm font-medium text-gray-700">
              {displayName}
            </span>
          </div>
        )}

        {signup.isGuest && (
          <span className="text-sm font-medium text-gray-700 italic">
            Gość: {displayName}
          </span>
        )}
      </div>

      {/* Daty treningu */}
      <div className="flex flex-col gap-3 text-sm">
        <div>
          <span className="block font-semibold">Start:</span>
          <span>{formatDate(signup.training.startTime)}</span>
        </div>
        <div>
          <span className="block font-semibold">Koniec:</span>
          <span>{formatDate(signup.training.endTime)}</span>
        </div>
      </div>

      {/* Status + countdown */}
      <div className="flex flex-col gap-1">
        <p className="text-sm">
          Status:{" "}
          <span
            className={
              signup.status === "confirmed"
                ? "text-green-600 font-medium"
                : signup.status === "pending"
                ? "text-yellow-600 font-medium"
                : "text-red-600 font-medium"
            }
          >
            {STATUS_LABELS[signup.status]}
          </span>
        </p>

        {signup.status === "pending" && (
          <p className="text-xs text-red-600">
            Wygasa za:{" "}
            {timeLeft > 0 ? `${hours}h ${minutes}m ${seconds}s` : "czas minął"}
          </p>
        )}
      </div>

      {/* Statystyki */}
      <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
        <span>
          <span className="font-semibold">Zapisanych: </span>
          {signup.training.signups.length} / {signup.training.maxParticipants}
        </span>
        <span>Zapisano: {formatDate(signup.signedAt)}</span>
      </div>

      {/* Akcja */}
      {canConfirm && (
        <button
          onClick={() => onConfirm(signup.trainingId, signup.id)}
          className="mt-2 self-end px-4 py-2 text-sm rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 active:scale-95 transition"
        >
          Potwierdź
        </button>
      )}
    </div>
  );
};

export default SignupCard;
