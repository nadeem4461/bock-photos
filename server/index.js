import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import photoRoutes from "./routes/photoRoutes.js";
import authRoutes from "./routes/auth.js";
// import authMiddleware from "./middleware/auth.js";
import authMiddleware from "./middleware/authMiddleware.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

// ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(uploadDir));
app.use("/api/photos", authMiddleware, photoRoutes);


// connect Mongo
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("Mongo error:", err));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/photos",photoRoutes);

app.get("/", (req, res) => res.send("📸 Bock Photos API running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
