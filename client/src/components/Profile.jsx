import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../auth";
import SignupCard from "./SignupCard";
import toast from "react-hot-toast";

const Profile = () => {
  const { user } = useAuth();
  const [signups, setSignups] = useState([]);

  useEffect(() => {
    const fetchSignups = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE}/api/trainings/signups/me`,
          { withCredentials: true }
        );
        setSignups(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSignups();
  }, []);

  const handleConfirm = async (trainingId, signupId) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_BASE}/api/trainings/${trainingId}/signup/${signupId}`,
        { status: "confirmed" },
        { withCredentials: true }
      );

      setSignups((prev) =>
        prev.map((s) => (s.id === signupId ? { ...s, status: "confirmed" } : s))
      );
      toast.success("Zapis potwierdzony ✅");
    } catch (err) {
      console.error(err);
      toast.error("Błąd przy potwierdzaniu zapisu");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Moje zapisy</h2>
      <div className="space-y-4">
        {signups.length > 0 ? (
          signups.map((s) => (
            <SignupCard key={s.id} signup={s} onConfirm={handleConfirm} />
          ))
        ) : (
          <div className="text-start text-gray-500 py-20">
            Brak zapisów do wyświetlenia
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
