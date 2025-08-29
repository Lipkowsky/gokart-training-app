import React, { useEffect, useState, useMemo } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useAuth } from "../auth";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import TrainingItem from "./TrainingItem";
import ConfirmModal from "./ConfirmModal";
import SearchBar from "./SearchBar";
import Pagination from "./Pagination";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const socket = io(mport.meta.env.VITE_API_BASE);
const ITEMS_PER_PAGE = 6;

const Trainings = () => {
  const [trainings, setTrainings] = useState([]);
  const [signupLoading, setSignupLoading] = useState(new Set());
  const [trainingToDelete, setTrainingToDelete] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/trainings", {
          withCredentials: true,
        });
        setTrainings(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTrainings();

    socket.on("new-training", (training) => {
      setTrainings((prev) => [...prev, training]);
    });

    socket.on("signup-created", ({ trainingId, signup }) => {
      setTrainings((prev) =>
        prev.map((t) =>
          t.id === trainingId
            ? { ...t, signups: [...(t.signups || []), signup] }
            : t
        )
      );
    });

    socket.on("signup-updated", ({ trainingId, signup }) => {
      setTrainings((prev) =>
        prev.map((t) =>
          t.id === trainingId
            ? {
                ...t,
                signups: t.signups.map((s) =>
                  s.id === signup.id ? signup : s
                ),
              }
            : t
        )
      );
    });

    // 🆕 obsługa usuwania treningu
    socket.on("training-deleted", ({ trainingId }) => {
      setTrainings((prev) => prev.filter((t) => t.id !== trainingId));
    });

    return () => {
      socket.off("new-training");
      socket.off("signup-created");
      socket.off("signup-updated");
      socket.off("training-deleted"); // 🧹 cleanup
    };
  }, []);

  const handleSignup = async (training) => {
    if (!user) {
      toast.loading("Musisz być zalogowany");

      return navigate("/login");
    }

    const freeSpots =
      training.maxParticipants - (training.signups?.length || 0);
    if (freeSpots <= 0) return toast.error("Brak wolnych miejsc");

    setSignupLoading((prev) => new Set(prev).add(training.id));
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE}/api/trainings/${training.id}/signup`,
        {},
        { withCredentials: true }
      );
      toast.success("Zapisano!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Błąd przy zapisie");
    } finally {
      setSignupLoading((prev) => {
        const newSet = new Set(prev);
        newSet.delete(training.id);
        return newSet;
      });
    }
  };

  const handleDeleteTraining = async (trainingId) => {
  try {
    await axios.delete(`${import.meta.env.VITE_API_BASE}/api/trainings/${trainingId}`, {
      withCredentials: true,
    });
    toast.success("Trening usunięty");

    // stan odświeży się także przez socket.io ("training-deleted"),
    // ale możesz zrobić optymistycznie:
    setTrainings((prev) => prev.filter((t) => t.id !== trainingId));
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.error || "Błąd przy usuwaniu");
  } finally {
    setTrainingToDelete(null); // zamykamy modal
  }
};

  // 🔍 Filtrowanie
  const filteredTrainings = useMemo(() => {
    const term = search.toLowerCase();

    return trainings.filter((t) => {
      const inTitle = t.title?.toLowerCase().includes(term);
      const inDesc = t.description?.toLowerCase().includes(term);
      const inCreator = t.createdBy?.name?.toLowerCase().includes(term);

      const start = t.startTime ? new Date(t.startTime) : null;
      const end = t.endTime ? new Date(t.endTime) : null;

      const startFormatted = start
        ? [
            format(start, "yyyy-MM-dd"),
            format(start, "dd.MM.yyyy", { locale: pl }),
            format(start, "dd MMMM yyyy", { locale: pl }),
          ]
        : [];

      const endFormatted = end
        ? [
            format(end, "yyyy-MM-dd"),
            format(end, "dd.MM.yyyy", { locale: pl }),
            format(end, "dd MMMM yyyy", { locale: pl }),
          ]
        : [];

      const inDate =
        startFormatted.some((f) => f.toLowerCase().includes(term)) ||
        endFormatted.some((f) => f.toLowerCase().includes(term));

      const inParticipants = t.signups?.some((s) => {
        return (
          s.user?.name?.toLowerCase().includes(term) ||
          s.user?.email?.toLowerCase().includes(term) ||
          s.status?.toLowerCase().includes(term)
        );
      });

      return inTitle || inDesc || inCreator || inDate || inParticipants;
    });
  }, [trainings, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTrainings.length / ITEMS_PER_PAGE)
  );
  const paginatedTrainings = filteredTrainings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 🔍 Search */}
      <div className="mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Szukaj treningów..."
          className="input"
        />
      </div>

      {/* 📋 Lista treningów */}
      {paginatedTrainings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedTrainings.map((training) => (
            <TrainingItem
              key={training.id}
              training={training}
              user={user}
              signupLoading={signupLoading}
              onSignup={handleSignup}
              onDelete={setTrainingToDelete} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-20">
          Brak treningów do wyświetlenia
        </div>
      )}

      {/* 📑 Paginacja */}
      <div className="mt-8">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

  
      <ConfirmModal
        open={!!trainingToDelete}
        onClose={() => setTrainingToDelete(null)}
        onConfirm={() =>
          trainingToDelete && handleDeleteTraining(trainingToDelete)
        }
        message="Czy na pewno chcesz usunąć trening?"
        confirmText="Usuń"
        confirmButtonClass="btn-primary"
        cancelButtonClass="btn-secondary"
      />
    </div>
  );
};

export default Trainings;
