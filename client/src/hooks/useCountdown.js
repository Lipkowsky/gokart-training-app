import { useEffect, useState } from "react";

export const useCountdown = (targetDate) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = new Date(targetDate) - new Date();
    return diff > 0 ? diff : 0;
  });

  useEffect(() => {
    if (!targetDate) return;

    const interval = setInterval(() => {
      const diff = new Date(targetDate) - new Date();
      setTimeLeft(diff > 0 ? diff : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return { timeLeft, hours, minutes, seconds };
};
