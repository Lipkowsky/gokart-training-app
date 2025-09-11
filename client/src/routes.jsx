import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./auth";
import { isAdmin } from "./utils/isAdmin";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex justify-center items-center p-6 min-h-screen">
        Ładowanie…
      </div>
    );
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export function AdminRoutes() {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex justify-center items-center p-6 min-h-screen">
        Ładowanie…
      </div>
    );
  return user && isAdmin(user) ? <Outlet /> : <Navigate to="/login" replace />;
}

// export const ROUTES = [
//   { path: "/", label: "Home", protected: false },
//   { path: "/login", label: "Login", protected: false },
//   { path: "/secret", label: "Sekret", protected: true },
// ]
