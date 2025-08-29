import React from "react"
import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "./auth"

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-6">Ładowanie…</div>
  return user ? <Outlet /> : <Navigate to="/login" replace />
}


// export const ROUTES = [
//   { path: "/", label: "Home", protected: false },
//   { path: "/login", label: "Login", protected: false },
//   { path: "/secret", label: "Sekret", protected: true },
// ]