import { Navigate } from "react-router-dom";

export default function App() {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" />;

  // If logged in → go to gallery
  return <Navigate to="/gallery" />;
}
