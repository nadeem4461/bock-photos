import React from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={{ padding: "50px" }}>
      <h2>📸 Welcome to Bock Photos Dashboard</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
