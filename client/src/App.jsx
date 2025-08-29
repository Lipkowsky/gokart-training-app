import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth";
import { ProtectedRoute } from "./routes";
import Secret from "./components/Secret";
import Header from "./components/Header";
import Login from "./components/Login";
import Trainings from "./components/Trainings";
import AddTraining from "./components/AddTraining";
import Profile from "./components/Profile";
import { Toaster } from "react-hot-toast";

function Home() {
  const { user } = useAuth();
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Witaj w starterze auth</h1>
      <p className="text-gray-700">
        Ten projekt pokazuje logowanie przez Google, ochronę tras i
        auto-odświeżanie sesji.
      </p>
      {user ? (
        <p className="mt-3">
          Zalogowano jako <strong>{user.name || user.email}</strong>.
        </p>
      ) : (
        <p className="mt-3">Nie jesteś zalogowany.</p>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Toaster position="top-right" />
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/secret" element={<Secret />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/trainings" element={<Trainings />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile/>} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="/addTraining" element={<AddTraining />} />
            </Route>
          </Routes>
        </main>
        <footer className="py-6 text-center text-xs text-gray-500">
          Gokart Training App
        </footer>
      </div>
    </AuthProvider>
  );
}
