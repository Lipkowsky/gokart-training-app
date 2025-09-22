import { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { MdListAlt, MdLogout, MdManageAccounts } from "react-icons/md";
import { IoMenu, IoAdd } from "react-icons/io5";
import logo from "../../assets/karting.png";
import { useAuth } from "../auth";
import { useNavigate } from "react-router-dom";
import { isAdmin } from "../utils/isAdmin";
import { FaUserAlt } from "react-icons/fa";
import axios from "axios";
import { io } from "socket.io-client";


const socket = io(import.meta.env.VITE_API_BASE, {
  withCredentials: true,
});

const Header = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // funkcja pomocnicza do pobrania liczby pending signups
  const fetchPending = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE}/api/trainings/signups/me`,
        { withCredentials: true }
      );
      if (Array.isArray(res.data)) {
        const pending = res.data.filter((s) => s.status === "pending");
        setPendingCount(pending.length);
      } else {
        setPendingCount(0);
      }
    } catch (err) {
      console.error("Failed to fetch signups", err);
      setPendingCount(0);
    }
  };

  useEffect(() => {
    if (!user) {
      setPendingCount(0);
      return;
    }
    fetchPending();

    socket.on("signup-created", fetchPending);
    socket.on("signup-updated", fetchPending);
    socket.on("signup-deleted", fetchPending);

    return () => {
      socket.off("signup-created", fetchPending);
      socket.off("signup-updated", fetchPending);
      socket.off("signup-deleted", fetchPending);
    };
  }, [user]);

  // menuItems zrobione tak, żeby nie zawierało false/undefined
  const menuItems = [
    {
      label: "Lista treningów",
      icon: <MdListAlt />,
      onClick: () => navigate("/trainings"),
    },
    {
      label: "Moje treningi",
      icon: <FaUserAlt />,
      onClick: () => navigate("/profile"),
    },
    ...(user && isAdmin(user)
      ? [
          {
            label: "Dodaj trening",
            icon: <IoAdd />,
            onClick: () => navigate("/addTraining"),
          },
          {
            label: "Zarządzaj użytkownikami",
            icon: <MdManageAccounts />,
            onClick: () => navigate("/manageUsers"),
          },
        ]
      : []),
  ];

  return (
    <header className="bg-primary text-black py-2 shadow-xl">
      <div className="mx-auto flex justify-between items-center px-4">
        {/* Logo + tytuł */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center cursor-pointer space-x-3"
        >
          <img src={logo} alt="GoKart Logo" className="h-8 w-auto" />
          <span className="text-base sm:text-lg md:text-[0.9rem] font-bold text-secondary leading-tight tracking-wide">
            Gokart Training App
          </span>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-2">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="relative flex items-center justify-center gap-2 px-3 py-1.5 font-semibold text-sm border rounded hover:bg-gray-50"
            >
              {item.icon}
              <span>{item.label}</span>
              {item.label === "Moje treningi" && pendingCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-green-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Prawa część: login / avatar */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <>
              <img
                onClick={() => navigate("/profile")}
                src={user.avatarUrl}
                alt="avatar"
                className="w-7 h-7 cursor-pointer rounded-full"
              />
              <span className="text-sm">{user.name || user.email}</span>
              <button
                onClick={logout}
                className="px-3 py-1.5 font-semibold text-sm border rounded hover:bg-gray-50"
              >
                <MdLogout size={16} />
              </button>
            </>
          ) : (
            <button
              onClick={login}
              className="flex items-center gap-2 px-4 py-2 text-sm border rounded hover:bg-gray-50"
            >
              <FcGoogle size={16} />
              <span className="font-semibold">Zaloguj</span>
            </button>
          )}
        </div>

        {/* Mobile burger menu */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <IoMenu size={24} />
        </button>
      </div>

      {/* Mobile side menu */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden bg-white border-t border-gray-200 shadow-md px-4 py-2 flex flex-col gap-2 z-50
          transition-all duration-300 ease-in-out
          ${
            mobileMenuOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-2"
          }`}
        >
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                item.onClick();
                setMobileMenuOpen(false);
              }}
              className="relative flex items-center gap-2 px-3 py-2 font-semibold border rounded hover:bg-gray-100 text-left"
            >
              {item.icon}
              <span>{item.label}</span>
              {item.label === "Moje treningi" && pendingCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}

          {user ? (
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 font-semibold border rounded hover:bg-gray-100"
            >
              <MdLogout size={16} />
              Wyloguj
            </button>
          ) : (
            <button
              onClick={login}
              className="flex items-center gap-2 px-3 py-2 font-semibold border rounded hover:bg-gray-100"
            >
              <FcGoogle size={16} />
              Zaloguj
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
