import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data?.user ?? null);
      } catch (err) {
        if (
          err.response?.status === 403 &&
          err.response?.data?.error === "Account blocked"
        ) {
          setUser(null);
          navigate("/blocked");
        }
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [navigate]);

  const login = () => {
    const base = import.meta.env.VITE_API_BASE;
    window.location.href = `${base}/auth/google`;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    setUser(null);
  };

  

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
