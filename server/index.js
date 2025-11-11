const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
// connect MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("Mongo error:", err));

// routes
app.get("/", (req, res) => res.send("Bock Photos API running"));

// auth routes will come here soon
app.listen(process.env.PORT, () =>
  console.log(`Server running on ${process.env.PORT}`)
);
