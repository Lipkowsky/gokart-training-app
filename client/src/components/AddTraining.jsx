import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../auth";
import {toast } from 'react-hot-toast';

const AddTraining = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    startTime: "",
    endTime: "",
    openAt: "",
    maxParticipants: 1,
    description: "",
  });

  if (!user) return <div className="p-6 text-center">You must be logged in</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE}/api/trainings`, form, {
        withCredentials: true,
      });
      setForm({
        title: "",
        startTime: "",
        endTime: "",
        openAt: "",
        maxParticipants: 1,
        description: "",
      });
      toast.success('Trening dodany!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to add training");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">➕ Add New Training</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="input"
              placeholder="Enter training title"
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Start Time</label>
            <input
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              required
              className="input"
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">End Time</label>
            <input
              type="datetime-local"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              required
              className="input"
            />
          </div>

          {/* Open At */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Opens At</label>
            <input
              type="datetime-local"
              value={form.openAt}
              onChange={(e) => setForm({ ...form, openAt: e.target.value })}
              className="input"
            />
          </div>

          {/* Max Participants */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Max Participants
            </label>
            <input
              type="number"
              value={form.maxParticipants}
              onChange={(e) => setForm({ ...form, maxParticipants: Number(e.target.value) })}
              min={1}
              className="input"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input min-h-[100px]"
              placeholder="Write a short description..."
            />
          </div>

          {/* Submit */}
          <button type="submit" className="btn-primary w-full">
            Add Training
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTraining;
