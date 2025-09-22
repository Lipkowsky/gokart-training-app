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
import { handleExportTrainingsToPDF } from "../utils/trainingsToPDF";
import { FaFilePdf } from "react-icons/fa6";
import { CiSaveDown2 } from "react-icons/ci";
import { formatDate } from "../utils/formatDate";

const socket = io(import.meta.env.VITE_API_BASE);
const ITEMS_PER_PAGE = 6;

const Trainings = () => {
  const [trainings, setTrainings] = useState([]);
  const [signupLoading, setSignupLoading] = useState(new Set());
  const [trainingToDelete, setTrainingToDelete] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [signupToDelete, setSignupToDelete] = useState(null);
  const [selectedTrainings, setSelectedTrainings] = useState([]);

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE}/api/trainings`,
          {
            withCredentials: true,
          }
        );
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

    socket.on("signup-deleted", ({ trainingId, signupId }) => {
      setTrainings((prev) =>
        prev.map((t) =>
          t.id === trainingId
            ? { ...t, signups: t.signups.filter((s) => s.id !== signupId) }
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
      socket.off("training-deleted");
      socket.off("signup-deleted");
    };
  }, []);

  const pendingSignups = useMemo(() => {
    const now = new Date();
    const userId = user?.id;

    return (
      trainings.flatMap((t) =>
        t.signups
          ?.filter(
            (s) =>
              s.status === "pending" &&
              new Date(s.expiresAt) > now &&
              (s.userId === userId || s.createdById === userId)
          )
          .map((s) => ({ ...s, trainingTitle: t.title }))
      ) || []
    );
  }, [trainings, user?.id]);

  const handleSelectTraining = (trainingId, checked) => {
    setSelectedTrainings((prev) =>
      checked ? [...prev, trainingId] : prev.filter((id) => id !== trainingId)
    );
  };

  const handleDeleteSignup = async () => {
    if (!signupToDelete) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE}/api/trainings/${
          signupToDelete.trainingId
        }/signup/${signupToDelete.signupId}`,
        { withCredentials: true }
      );
      toast.success("Zawodnik usunięty");
      setTrainings((prev) =>
        prev.map((t) =>
          t.id === signupToDelete.trainingId
            ? {
                ...t,
                signups: t.signups.filter(
                  (s) => s.id !== signupToDelete.signupId
                ),
              }
            : t
        )
      );
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Błąd przy usuwaniu zawodnika");
    } finally {
      setSignupToDelete(null);
    }
  };

  const handleSignup = async (training) => {
    if (!user) {
      toast.error("Musisz być zalogowany");

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
      await axios.delete(
        `${import.meta.env.VITE_API_BASE}/api/trainings/${trainingId}`,
        {
          withCredentials: true,
        }
      );
      toast.success("Trening usunięty");

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
    <div className="p-6 max-w-8xl mx-auto">
      {pendingSignups.length > 0 && (
        <div className="bg-white border border-yellow-300 rounded-2xl shadow-lg overflow-hidden mb-5">
          <div className="flex items-center gap-3 bg-yellow-100 px-4 py-3 border-b border-yellow-200">
            <h2 className="font-semibold text-yellow-800">
              Masz {pendingSignups.length} zapis
              {pendingSignups.length > 1 ? "y" : ""} do potwierdzenia
            </h2>
          </div>

          <div className="flex flex-col divide-y divide-gray-100">
            {pendingSignups.map((s) => (
              <div
                key={s.id}
                className="flex flex-col sm:flex-row justify-between px-5 py-4 hover:bg-gray-50 transition"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {s.user?.name || s.guestName}
                  </p>
                  <p className="text-sm text-gray-500">
                    na trening{" "}
                    <span className="font-semibold text-gray-700">
                      „{s.trainingTitle}”
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2 sm:mt-0">
                  <span className="font-semibold">
                    potwierdź do {formatDate(s.expiresAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex mb-6 gap-2 items-stretch">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Szukaj treningów..."
          className="flex-[0.95]" // 80%
        />
        <button
          onClick={() => {
            const trainingsToExport = trainings.filter((t) =>
              selectedTrainings.includes(t.id)
            );
            handleExportTrainingsToPDF(trainingsToExport);
          }}
          disabled={selectedTrainings.length <= 0}
          className="flex-[0.05] bg-slate-600 hover:bg-slate-700 disabled:bg-gray-300 disabled:cursor-not-allowed px-2 cursor-pointer text-white font-semibold text-md rounded-md"
        >
          <span className="flex justify-center gap-2">
            <FaFilePdf />
            <CiSaveDown2 />
          </span>
        </button>
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
              onDeleteSignup={setSignupToDelete}
              isSelected={selectedTrainings.includes(training.id)}
              onSelect={(checked) => handleSelectTraining(training.id, checked)}
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
        confirmButtonClass="btn-dangerous"
        cancelButtonClass="btn-secondary"
      />
      <ConfirmModal
        open={!!signupToDelete}
        onClose={() => setSignupToDelete(null)}
        onConfirm={handleDeleteSignup}
        message="Czy na pewno chcesz usunąć tego zawodnika z treningu?"
        confirmText="Usuń"
        confirmButtonClass="btn-dangerous"
        cancelButtonClass="btn-secondary"
      />
    </div>
  );
};

export default Trainings;
