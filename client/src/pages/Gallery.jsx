import React, { useEffect, useState } from "react";
import axios from "axios";
import PhotoModal from "../components/PhotoModal";

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  const token = localStorage.getItem("token");

  const fetchPhotos = async () => {
    const res = await axios.get("http://localhost:5000/api/photos", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPhotos(res.data);
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFiles.length) return;

    const form = new FormData();
    for (let f of selectedFiles) form.append("files", f);

    setLoading(true);
    await axios.post("http://localhost:5000/api/photos/upload", form, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    setLoading(false);
    setSelectedFiles([]);
    fetchPhotos();
  };
const deletePhoto = async (id) => {
  const token = localStorage.getItem("token");

  await axios.put(
    `http://localhost:5000/api/photos/delete/${id}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  fetchPhotos();
};



  return (
    
    <div className="min-h-screen bg-gray-100">


      {/* Navbar */}
      <div className="flex justify-between items-center p-4 bg-white shadow">
        <h1 className="text-2xl font-bold">📸 Bock Photos</h1>
              <a
  href="/trash"
  className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-800"
>
  Trash
</a>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location = "/";
          }}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Upload */}
      <form onSubmit={handleUpload} className="flex gap-3 p-4">
        <input
          type="file"
          multiple
          onChange={(e) => setSelectedFiles(e.target.files)}
          className="bg-white border border-gray-300 p-2 rounded w-64"
        />
        <button
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {/* Masonry Grid */}
      <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 p-4">
        {photos.map((p, i) => (
          <div key={p._id} className="relative mb-4 cursor-pointer">
            <img
              src={`http://localhost:5000${p.thumbPath}`}
              alt={p.name}
              className="w-full rounded-lg shadow hover:opacity-90"
              onClick={() => setActiveIndex(i)}
            />
     <button
  onClick={() => deletePhoto(p._id)}
  className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded"
>
  Delete
</button>


            {p.duplicateOf && (
              <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 rounded">
                Duplicate
              </span>
            )}
          </div>
        ))}
      </div>

      {/* MODAL */}
      {activeIndex !== null && (
        <PhotoModal
          photo={photos[activeIndex]}
          onClose={() => setActiveIndex(null)}
          onNext={() =>
            setActiveIndex((prev) => (prev + 1) % photos.length)
          }
          onPrev={() =>
            setActiveIndex((prev) =>
              prev === 0 ? photos.length - 1 : prev - 1
            )
          }
        />
      )}
    </div>
  );
}
