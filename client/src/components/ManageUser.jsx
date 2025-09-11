import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useAuth } from "../auth";
import toast from "react-hot-toast";
import { FaLock, FaUnlock } from "react-icons/fa";

const ManageUser = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const updateUser = async (userId, changes) => {
    try {
      const { data } = await axios.patch(
        `${import.meta.env.VITE_API_BASE}/api/manageUsers/${userId}`,
        changes,
        { withCredentials: true }
      );

      setUsers((prev) => prev.map((u) => (u.id === userId ? data : u)));

      toast.success("Zmiany zapisane");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Nie udało się zapisać zmian");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto text-xs">
      <h1 className="mb-6 text-2xl font-bold text-center">
        Zarządzanie użytkownikami
      </h1>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {users.map(({ id, avatarUrl, name, email, role, isBlocked }) => (
          <div
            key={id}
            className="flex flex-col items-center p-4 text-center bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            {/* Info użytkownika */}
            <div className={`flex flex-col items-center w-full ${isBlocked ? "opacity-30" : ""}`}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name || email}
                  className="w-20 h-20 mb-4 rounded-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-20 h-20 mb-4 text-xl font-semibold text-gray-500 bg-gray-200 rounded-full">
                  {name ? name[0].toUpperCase() : email[0].toUpperCase()}
                </div>
              )}

              <h2 className="text-lg font-semibold">{name || "—"}</h2>
              <p className="mb-2 text-gray-600">{email}</p>

              {/* Select roli */}
              <label className="mb-2 font-medium text-gray-700">Rola</label>
              <select
                value={role}
                onChange={(e) => updateUser(id, { role: e.target.value })}
                className="w-full px-3 py-2 mb-2 text-center border rounded border-slate-400"
                disabled={isBlocked}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Blokada */}
            <button
              onClick={() => updateUser(id, { isBlocked: !isBlocked })}
              className={`mt-2 px-3 py-1 rounded flex items-center gap-1 text-white ${
                isBlocked
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {isBlocked ? <FaUnlock /> : <FaLock />}
              {isBlocked ? "Odblokuj" : "Zablokuj"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageUser;
