import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export async function ensureAuth(req, res, next) {
  const token = req.cookies["access_token"];
  if (!token) return res.status(401).json({ error: "No access token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // sprawdzamy czy user istnieje i nie jest zablokowany
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, isBlocked: true },
    });

    if (user?.isBlocked) {
      await prisma.refreshToken.updateMany({
        where: { userId: user.id, isValid: true },
        data: { isValid: false },
      });
      res.clearCookie("access_token");
      res.clearCookie("refresh_token");
      return res.status(403).json({ error: "Account blocked" });
    }

    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid access token" });
  }
}
