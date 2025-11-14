import mongoose from "mongoose";

const PhotoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  name: String,
  mimeType: String,
  size: Number,

  path: String,
  thumbPath: String,

  phash: String,
  duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: "Photo" },

  exif: Object,

  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });   // IMPORTANT ✔✔✔

export default mongoose.model("Photo", PhotoSchema);
