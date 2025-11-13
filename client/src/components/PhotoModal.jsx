import React, { useEffect } from "react";

export default function PhotoModal({ photo, onClose, onNext, onPrev }) {
  if (!photo) return null;

  // Close modal on ESC key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-[9999]">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white text-3xl font-bold hover:text-gray-300"
      >
        ✕
      </button>

      {/* Left Arrow */}
      <button
        onClick={onPrev}
        className="absolute left-5 text-white text-4xl hover:text-gray-300"
      >
        ❮
      </button>

      {/* Right Arrow */}
      <button
        onClick={onNext}
        className="absolute right-5 text-white text-4xl hover:text-gray-300"
      >
        ❯
      </button>

      {/* Photo */}
      <img
        src={`http://localhost:5000${photo.path}`}
        alt=""
        className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg transition-all"
      />

      {/* EXIF + Info */}
      <div className="absolute bottom-5 left-5 text-white bg-black bg-opacity-40 px-4 py-2 rounded-lg text-sm">
        <p><b>Name:</b> {photo.name}</p>
        <p><b>Size:</b> {(photo.size / 1024).toFixed(1)} KB</p>
        <p><b>MIME:</b> {photo.mimeType}</p>
        {photo.exif?.Model && <p><b>Camera:</b> {photo.exif.Model}</p>}
      </div>
    </div>
  );
}
