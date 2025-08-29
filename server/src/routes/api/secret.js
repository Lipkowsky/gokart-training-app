import express from "express";
import { ensureAuth } from "../../middleware/ensureAuth.js";
import { prisma } from '../../lib/prisma.js';

const router = express.Router();

router.get("/", ensureAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      select: { email: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: `Witaj!, użytkowniku ${user.email}! To jest sekret.` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
