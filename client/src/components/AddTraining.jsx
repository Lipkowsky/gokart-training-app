import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../auth";
import { toast } from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useEffect } from "react";
import { useTrainingCopyStore } from "../store/useTrainingCopyStore";

const AddTraining = () => {
  const { copiedTraining, clearCopiedTraining } = useTrainingCopyStore();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    startTime: null,
    endTime: null,
    openAt: null,
    maxParticipants: 1,
    description: "",
  });

  useEffect(() => {
    if (copiedTraining) {
      setForm(copiedTraining);
      clearCopiedTraining(); // czyścimy po załadowaniu, żeby nie nadpisywało za każdym wejściem
    }
  }, [copiedTraining, clearCopiedTraining]);

  if (!user)
    return <div className="p-6 text-center">Musisz być zalogowany</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Walidacja długości opisu
    if (form.description.length > 191) {
      toast.error("Opis nie może przekraczać 191 znaków!");
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE}/api/trainings`, form, {
        withCredentials: true,
      });
      setForm({
        title: "",
        startTime: null,
        endTime: null,
        openAt: null,
        maxParticipants: 1,
        description: "",
      });
      toast.success("Trening dodany!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Nie udało się dodać treningu");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          ➕ Dodaj nowy trening
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tytuł */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Tytuł *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="input w-full text-sm"
              placeholder="Wpisz tytuł treningu"
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Data rozpoczęcia *
            </label>
            <DatePicker
              selected={form.startTime}
              onChange={(date) => setForm({ ...form, startTime: date })}
              showTimeSelect
              timeIntervals={1}
              dateFormat="dd.MM.yyyy HH:mm"
              className="input w-full text-sm"
              placeholderText="Wybierz datę i godzinę rozpoczęcia"
              required
              wrapperClassName="w-full"
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Data zakończenia *
            </label>
            <DatePicker
              selected={form.endTime}
              onChange={(date) => setForm({ ...form, endTime: date })}
              showTimeSelect
              timeIntervals={1}
              dateFormat="dd.MM.yyyy HH:mm"
              className="input w-full text-sm"
              placeholderText="Wybierz datę i godzinę zakończenia"
              required
              wrapperClassName="w-full"
            />
          </div>

          {/* Open At */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Otwarcie zapisów *
            </label>
            <DatePicker
              selected={form.openAt}
              onChange={(date) => setForm({ ...form, openAt: date })}
              showTimeSelect
              timeIntervals={1}
              dateFormat="dd.MM.yyyy HH:mm"
              className="input w-full text-sm"
              placeholderText="Wybierz datę otwarcia zapisów"
              required
              wrapperClassName="w-full"
            />
          </div>

          {/* Max Participants */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Maksymalna liczba uczestników *
            </label>
            <input
              type="number"
              value={form.maxParticipants}
              onChange={(e) => {
                const value = Math.max(1, Number(e.target.value));
                setForm({ ...form, maxParticipants: value });
              }}
              min={1}
              step={1}
              className="input w-full text-sm"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Opis treningu
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="input min-h-[100px] w-full text-sm"
              placeholder="Napisz krótki opis treningu..."
            />
            <p className="text-sm text-gray-500">
              {form.description.length}/191 znaków
            </p>
            {form.description.length > 191 && (
              <p className="text-sm text-red-600">
                Opis nie może przekraczać 191 znaków!
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 rounded-xl"
          >
            Dodaj trening
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTraining;
