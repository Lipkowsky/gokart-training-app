import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useAuth } from "../auth";
import toast from "react-hot-toast";
import ConfirmModal from "./ConfirmModal"; // twój modal potwierdzenia

const ManageUser = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pendingChanges, setPendingChanges] = useState({});
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const socket = io(import.meta.env.VITE_API_BASE, {
      withCredentials: true,
      auth: { token: user.accessToken },
    });

    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_BASE}/api/manageUsers`,
          { withCredentials: true }
        );
        setUsers(data);
      } catch (err) {
        console.error(err);
        toast.error("Nie udało się pobrać użytkowników");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    socket.on("user-updated", (updatedUser) => {
      setUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
      
    });

    return () => socket.disconnect();
  }, [user]);

  const handleSelectChange = (userId, field, value) => {
    setPendingChanges((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value },
    }));
  };

  const handleSubmit = (userId) => {
    setSelectedUser(userId);
    setModalOpen(true);
  };

  const confirmChanges = async () => {
    const changes = pendingChanges[selectedUser];
    if (!changes) return;

    try {
      if (changes.role) {
        await axios.patch(
          `${import.meta.env.VITE_API_BASE}/api/manageUsers/${selectedUser}/role`,
          { role: changes.role },
          { withCredentials: true }
        );
      }
      // jeśli będą kolejne pola, dodasz tu kolejne requesty

      toast.success("Zmiany zapisane");
      setPendingChanges((prev) => {
        const copy = { ...prev };
        delete copy[selectedUser];
        return copy;
      });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Nie udało się zapisać zmian");
    } finally {
      setModalOpen(false);
      setSelectedUser(null);
    }
  };

  if (loading)
    return <div className="p-6 text-center text-gray-500">Ładowanie użytkowników...</div>;

  return (
    <div className="p-6 max-w-6xl text-xs mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Zarządzanie użytkownikami</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {users.map((u) => {
          const userChanges = pendingChanges[u.id] || {};
          return (
            <div
              key={u.id}
              className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
            >
              {u.avatarUrl ? (
                <img
                  src={u.avatarUrl}
                  alt={u.name || u.email}
                  className="w-20 h-20 rounded-full mb-4 object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-4 text-xl font-semibold text-gray-500">
                  {u.name ? u.name[0].toUpperCase() : u.email[0].toUpperCase()}
                </div>
              )}
              <h2 className="font-semibold text-lg">{u.name || "—"}</h2>
              <p className="text-gray-600 mb-2">{u.email}</p>
              <label className="text-gray-700 font-medium mb-2">Rola</label>
              <select
                value={userChanges.role || u.role}
                onChange={(e) => handleSelectChange(u.id, "role", e.target.value)}
                className="border rounded px-3 py-2 mb-4 w-full text-center"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={() => handleSubmit(u.id)}
                disabled={!userChanges.role || userChanges.role === u.role}
                className={`px-4 py-2 rounded text-white w-full ${
                  !userChanges.role || userChanges.role === u.role
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 transition"
                }`}
              >
                Zapisz zmiany
              </button>
            </div>
          );
        })}
      </div>

      <ConfirmModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmChanges}
        message="Czy na pewno chcesz zapisać zmiany?"
        confirmText="Tak, zapisz"
        confirmButtonClass="btn-success"
        cancelButtonClass="btn-secondary"
      />
    </div>
  );
};

export default ManageUser;
