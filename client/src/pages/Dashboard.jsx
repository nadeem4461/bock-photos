import React from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* TOP NAVBAR */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>📸</span> Bock Photos
        </h1>

        <div className="flex items-center gap-6">
          <Link
            to="/gallery"
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            Gallery
          </Link>

          <Link
            to="/trash"
            className="text-gray-700 hover:text-red-600 font-medium"
          >
            Trash
          </Link>

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="p-10">
        <h2 className="text-3xl font-bold mb-4">
          Welcome to Bock Photos Dashboard
        </h2>

        <p className="text-gray-600 text-lg">
          Manage your photos, view duplicates, restore deleted items, and more.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Gallery Card */}
          <Link
            to="/gallery"
            className="bg-white shadow rounded-lg p-6 hover:shadow-md transition cursor-pointer"
          >
            <h3 className="text-xl font-semibold mb-2">📁 Your Gallery</h3>
            <p className="text-gray-600 text-sm">
              View all uploaded photos, detect duplicates, upload new images.
            </p>
          </Link>

          {/* Trash Card */}
          <Link
            to="/trash"
            className="bg-white shadow rounded-lg p-6 hover:shadow-md transition cursor-pointer"
          >
            <h3 className="text-xl font-semibold mb-2">🗑 Trash</h3>
            <p className="text-gray-600 text-sm">
              Recover deleted photos or permanently erase them.
            </p>
          </Link>

        </div>
      </div>
    </div>
  );
}
