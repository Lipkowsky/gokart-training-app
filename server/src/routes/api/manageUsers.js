import express from "express";
import { ensureAuth } from "../../middleware/ensureAuth.js";
import { ensureAdmin } from "../../middleware/ensureAdmin.js";
import { prisma } from "../../lib/prisma.js";
import { io } from "../../index.js"; // Twój socket.io

const router = express.Router();

/**
 * GET /api/manageUsers
 * Pobiera wszystkich użytkowników (tylko admin)
 */
router.get("/", ensureAuth, ensureAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, avatarUrl: true },
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/**
 * PATCH /api/manageUsers/:id/role
 * Zmiana roli użytkownika
 */
router.patch("/:id/role", ensureAuth, ensureAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const validRoles = ["user", "admin", "moderator"];
  if (!validRoles.includes(role)) return res.status(400).json({ error: "Invalid role" });

  try {
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { role },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true },
    });

    // 🔔 Emit do wszystkich podłączonych klientów
    io.emit("user-updated", updatedUser);

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update role" });
  }
});

export default router;
