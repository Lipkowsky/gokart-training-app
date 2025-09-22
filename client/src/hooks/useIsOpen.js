import { useEffect, useState } from "react";

export const useIsOpen = (openAt) => {
  const [isOpen, setIsOpen] = useState(() => new Date(openAt) <= new Date());

  useEffect(() => {
    const openTime = new Date(openAt).getTime();
    const now = Date.now();

    if (openTime <= now) return; // już otwarte

    const timeout = setTimeout(() => {
      setIsOpen(true);
    }, openTime - now);

    return () => clearTimeout(timeout);
  }, [openAt]);

  return isOpen;
};
