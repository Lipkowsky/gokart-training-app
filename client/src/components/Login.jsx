
import { useAuth } from "../auth";
import { FcGoogle } from "react-icons/fc"; // 👈 import ikony

const Login = () => {
  const { login } = useAuth();

  return (
    <div className="flex justify-center items-center h-screen">
      <button
        onClick={login}
        className="flex items-center gap-2 px-4 py-2 text-sm border rounded hover:bg-gray-50"
      >
        <FcGoogle size={20} /> {/* 👈 ikona */}
        <span>Logowanie</span>
      </button>
    </div>
  );
};

export default Login;
