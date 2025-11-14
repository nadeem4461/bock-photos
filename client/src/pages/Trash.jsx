import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Trash() {
  const [trash, setTrash] = useState([]);
  const token = localStorage.getItem("token");

  const fetchTrash = async () => {
    const res = await axios.get("http://localhost:5000/api/photos/trash", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTrash(res.data);
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const restore = async (id) => {
    await axios.put(
      `http://localhost:5000/api/photos/restore/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchTrash();
  };

  const deleteForever = async (id) => {
    await axios.delete(
      `http://localhost:5000/api/photos/delete-forever/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchTrash();
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Trash</h1>

      <div className="columns-2 sm:columns-3 md:columns-4 gap-4">
        {trash.map((p) => (
          <div key={p._id} className="mb-4 break-inside-avoid">

            <img
              src={`http://localhost:5000${p.thumbPath}`}
              className="rounded-lg shadow mb-2"
            />

            <div className="flex gap-2 mb-1">
              <button
                onClick={() => restore(p._id)}
                className="bg-green-600 text-white px-2 py-1 rounded"
              >
                Restore
              </button>

              <button
                onClick={() => deleteForever(p._id)}
                className="bg-red-600 text-white px-2 py-1 rounded"
              >
                Delete Forever
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Will delete in{" "}
              {30 -
                Math.floor(
                  (Date.now() - new Date(p.deletedAt)) /
                  (1000 * 60 * 60 * 24)
                )}{" "}
              days
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
