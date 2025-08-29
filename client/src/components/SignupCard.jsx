import React from "react";
import { formatDate } from "../utils/formatDate";
import { useCountdown } from "../hooks/useCountdown";

const SignupCard = ({ signup, onConfirm }) => {
  const { hours, minutes, seconds, timeLeft } = useCountdown(signup.expiresAt);

  const STATUS_LABELS = {
    confirmed: "Potwierdzony",
    pending: "Oczekuje potwierdzenia",
    cancelled: "Anulowany",
  };

  return (
    <div className="border rounded-2xl shadow-md p-4 bg-white flex justify-between items-center">
      <div>
        <p className="font-bold">{signup.training?.title}</p>
        <p className="text-sm text-gray-600">
          {formatDate(signup.training?.startTime)} –{" "}
          {formatDate(signup.training?.endTime)}
        </p>
        <p className="text-sm">
          Status:{" "}
          <span
            className={
              signup.status === "confirmed"
                ? "text-green-600"
                : "text-yellow-600"
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

      {signup.status === "pending" && timeLeft > 0 && (
        <button
          onClick={() => onConfirm(signup.trainingId, signup.id)}
          className="px-3 py-1 rounded bg-green-500 text-white"
        >
          Potwierdź
        </button>
      )}
    </div>
  );
};

export default SignupCard;
