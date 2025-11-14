import express from "express";
import multer from "multer";
import sharp from "sharp";
import exifr from "exifr";
import imghash from "imghash";
import path from "path";
import fs from "fs";
import Photo from "../models/Photo.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// =======================
// MULTER
// =======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s/g, "-"));
  }
});
const upload = multer({ storage });


// =======================
// PHASH + HAMMING
// =======================
async function computePhash(filePath) {
  return await imghash.hash(filePath, 16);
}

function hamming(a, b) {
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    const n1 = parseInt(a[i], 16);
    const n2 = parseInt(b[i], 16);
    diff += ((n1 ^ n2).toString(2).match(/1/g) || []).length;
  }
  return diff;
}


// =======================
// UPLOAD PHOTOS
// =======================
router.post(
  "/upload",
  authMiddleware,
  upload.array("files", 10),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const uploaded = [];

      for (const f of req.files) {
        const thumbPath = f.path + "-thumb.jpg";
        await sharp(f.path).resize(800).toFile(thumbPath);

        const exif = await exifr.parse(f.path).catch(() => null);
        const phash = await computePhash(f.path);

        const userPhotos = await Photo.find({ userId }).select("phash");
        let duplicateOf = null;

        for (const p of userPhotos) {
          if (!p.phash) continue;

          const dist = hamming(phash, p.phash);
          if (dist <= 6) {
            duplicateOf = p._id;
            break;
          }
        }

        const doc = await Photo.create({
          userId,
          name: f.originalname,
          mimeType: f.mimetype,
          size: f.size,
          path: "/uploads/" + path.basename(f.path),
          thumbPath: "/uploads/" + path.basename(thumbPath),
          phash,
          duplicateOf,
          exif
        });

        uploaded.push(doc);
      }

      res.json({ ok: true, uploaded });

    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      res.status(500).json({ ok: false, error: "Failed to upload photos" });
    }
  }
);


// =======================
// GET PHOTOS (not deleted)
// =======================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const photos = await Photo.find({ userId, isDeleted: false }).sort({
      createdAt: -1
    });

    res.json(photos);
  } catch (err) {
    console.error("GET PHOTOS ERROR:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});


// =======================
// GET TRASH
// =======================
router.get("/trash", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const trashed = await Photo.find({ userId, isDeleted: true }).sort({
      deletedAt: -1
    });

    res.json(trashed);
  } catch (err) {
    console.error("TRASH ERROR:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});


// =======================
// MOVE TO TRASH
// =======================
router.put("/delete/:id", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;

    const photo = await Photo.findById(id);
    if (!photo)
      return res.status(404).json({ ok: false, message: "Photo not found" });

    if (String(photo.userId) !== String(userId))
      return res.status(403).json({ ok: false, message: "Unauthorized" });

    await Photo.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date()
    });

    res.json({ ok: true, message: "Moved to trash" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ ok: false, error: "Failed to move to trash" });
  }
});


// =======================
// RESTORE
// =======================
router.put("/restore/:id", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;

    const photo = await Photo.findById(id);
    if (!photo) return res.status(404).json({ ok: false, message: "Not found" });

    if (String(photo.userId) !== String(userId))
      return res.status(403).json({ ok: false, message: "Unauthorized" });

    await Photo.findByIdAndUpdate(id, {
      isDeleted: false,
      deletedAt: null
    });

    res.json({ ok: true, message: "Photo restored" });
  } catch (err) {
    console.error("RESTORE ERROR:", err);
    res.status(500).json({ ok: false, error: "Failed to restore" });
  }
});


// =======================
// DELETE FOREVER
// =======================
router.delete("/delete-forever/:id", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;

    const photo = await Photo.findById(id);
    if (!photo)
      return res.status(404).json({ ok: false, message: "Not found" });

    if (String(photo.userId) !== String(userId))
      return res.status(403).json({ ok: false, message: "Unauthorized" });

    // Delete original
    try {
      fs.unlinkSync(path.join(process.cwd(), photo.path));
    } catch {}

    // Delete thumb
    try {
      fs.unlinkSync(path.join(process.cwd(), photo.thumbPath));
    } catch {}

    await Photo.findByIdAndDelete(id);

    res.json({ ok: true, message: "Deleted permanently" });
  } catch (err) {
    console.error("DELETE FOREVER ERROR:", err);
    res.status(500).json({ ok: false, error: "Failed to delete permanently" });
  }
});

export default router;
