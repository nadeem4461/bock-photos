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

// Multer setup
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

// ✅ Correct computePhash function
async function computePhash(filePath) {
  return await imghash.hash(filePath, 16); // 16 = 64-bit pHash
}

// Hamming distance
function hamming(a, b) {
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    const n1 = parseInt(a[i], 16);
    const n2 = parseInt(b[i], 16);
    diff += ((n1 ^ n2).toString(2).match(/1/g) || []).length;
  }
  return diff;
}

router.post("/upload",authMiddleware,upload.array("files", 10), async (req, res) => {
  try {
    const userId = req.user.id ;
    const uploaded = [];

    for (const f of req.files) {
      // Create thumbnail
      const thumbPath = f.path + "-thumb.jpg";
      await sharp(f.path).resize(800).toFile(thumbPath);

      // EXIF data
      const exif = await exifr.parse(f.path).catch(() => null);

      // Compute pHash
      const phash = await computePhash(f.path);

      // Check duplicates
      const allPhotos = await Photo.find({ userId }).select("phash");
      let duplicateOf = null;

      for (const p of allPhotos) {
        if (!p.phash) continue;

        const dist = hamming(phash, p.phash);
        if (dist <= 6) {
          duplicateOf = p._id;
          break;
        }
      }

      // Save photo
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
});

router.get("/", authMiddleware, async (req, res) => {
  const photos = await Photo.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(photos);
});


export default router;
