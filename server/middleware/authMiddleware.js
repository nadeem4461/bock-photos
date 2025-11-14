import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // No token?
  if (!authHeader) {
    return res.status(401).json({ ok: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Make sure req.user.id always exists
    req.user = { id: decoded.id };

    next();
  } catch (err) {
    return res.status(401).json({ ok: false, message: "Invalid token" });
  }
}
