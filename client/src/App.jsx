import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth";
import { AdminRoutes, ProtectedRoute } from "./routes";
import Secret from "./components/Secret";
import Header from "./components/Header";
import Login from "./components/Login";
import Trainings from "./components/Trainings";
import AddTraining from "./components/AddTraining";
import Profile from "./components/Profile";
import { Toaster } from "react-hot-toast";
import ManageUser from "./components/ManageUser";
import BlockedPage from "./components/BlockedPage";

function Home() {
  const { user } = useAuth();
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Witaj!</h1>

      <p className="text-gray-700 mb-4 leading-relaxed">
        Nasza aplikacja została stworzona z myślą o torach gokartowych, które
        chcą sprawnie zarządzać swoimi treningami i wydarzeniami. Dzięki niej
        możesz w łatwy sposób planować sesje treningowe i rejestrować
        uczestników.
      </p>

      <p className="text-gray-700 mb-4 leading-relaxed">
        Kontroluj dostęp do toru oraz monitoruj dostępne sloty czasowe. Wszystko
        w jednym miejscu, tak aby organizacja wydarzeń była szybka i
        przejrzysta.
      </p>

      <p className="text-gray-700 leading-relaxed">
        Nasza aplikacja sprawia, że zarządzanie treningami staje się łatwe i
        bezproblemowe – zarówno dla Ciebie, jak i dla osób korzystających z
        toru.
      </p>
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
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route element={<AdminRoutes />}>
              <Route path="/addTraining" element={<AddTraining />} />
            </Route>
            <Route element={<AdminRoutes />}>
              <Route path="/manageUsers" element={<ManageUser />} />
            </Route>
             <Route path="/blocked" element={<BlockedPage />} />
          </Routes>
        </main>
        <footer className="py-6 text-center text-xs text-gray-500">
          Gokart Training App
        </footer>
      </div>
    </AuthProvider>
  );
}
