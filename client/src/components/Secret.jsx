import React from "react";
import { useEffect } from "react";
import api from "../api";

const Secret = () => {
  const [msg, setMsg] = React.useState("");
  const load = async () => {
    const { data } = await api.get("/api/secret");
    setMsg(data.message);
  };
  useEffect(() => {
    load();
  }, []);
  return (
    <div className="max-w-3xl mx-auto p-6">
      
      <pre className="p-3 bg-gray-100 rounded">{msg}</pre>
    </div>
  );
};

export default Secret;
