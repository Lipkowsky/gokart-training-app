import express from "express";
import { ensureAuth } from "../../middleware/ensureAuth.js";
import { prisma } from "../../lib/prisma.js";
import { io } from "../../index.js";
import { ensureAdmin } from "../../middleware/ensureAdmin.js";

const router = express.Router();

/**
 * GET /api/trainings
 * Pobiera wszystkie treningi z bazy wraz z informacjami o twórcy i zapisach
 */
router.get("/", async (req, res) => {
  try {
    const trainings = await prisma.training.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        signups: {
          include: {
            user: true, // użytkownik jeśli zwykły zapis
            createdBy: { select: { id: true, name: true, email: true } }, // kto dodał (dla gościa)
          },
        },
      },
      orderBy: { startTime: "asc" },
    });
    res.json(trainings);
  } catch (err) {
    console.error("Error fetching trainings:", err);
    res.status(500).json({ error: "Failed to fetch trainings" });
  }
});

/**
 * POST /api/trainings
 * Tworzy nowy trening i emituje go do wszystkich klientów w czasie rzeczywistym
 */
router.post("/", ensureAuth, ensureAdmin, async (req, res) => {
  const { title, description, startTime, endTime, openAt, maxParticipants } =
    req.body;

  if (!title || !startTime || !maxParticipants) {
    return res
      .status(400)
      .json({ error: "Title, startTime and maxParticipants are required" });
  }

  try {
    const training = await prisma.training.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        openAt: openAt ? new Date(openAt) : null,
        maxParticipants,
        createdBy: {
          connect: { id: req.user.sub },
        },
      },
    });

    io.emit("new-training", training);
    res.status(201).json(training);
  } catch (err) {
    console.error("Error creating training:", err);
    res.status(500).json({ error: "Failed to create training" });
  }
});

/**
 * POST /api/trainings/:id/signup
 * Tworzy nowy zapis w transakcji
 */
router.post("/:id/signup", ensureAuth, async (req, res) => {
  const { id } = req.params;
  const { guestName } = req.body;
  const isGuest = Boolean(guestName);

  try {
    const signup = await prisma.$transaction(
      async (tx) => {
        // 🔒 blokada na trening
        const trainings = await tx.$queryRaw`
          SELECT * FROM Training WHERE id = ${id} FOR UPDATE
        `;
        const training = trainings[0];
        if (!training) throw new Error("Trening nie znaleziony");

        // 🔒 sprawdzenie daty otwarcia zapisów
        if (training.openAt && new Date(training.openAt) > new Date()) {
          throw new Error(
            `Zapisy rozpoczną się: ${new Date(training.openAt).toLocaleString(
              "pl-PL"
            )}`
          );
        }

        // 🔎 sprawdzenie limitu miejsc
        const [{ count }] = await tx.$queryRaw`
          SELECT COUNT(*) AS count
          FROM TrainingsSignup
          WHERE trainingId = ${training.id}
            AND (status = 'confirmed' OR (status = 'pending' AND expiresAt > NOW()))
        `;
        if (Number(count) >= training.maxParticipants) {
          throw new Error("Training is full");
        }

        // 🔎 jeśli zwykły użytkownik, sprawdź, czy już zapisany
        if (!isGuest) {
          const existing = await tx.trainingsSignup.findFirst({
            where: {
              userId: req.user.sub,
              trainingId: training.id,
              OR: [
                { status: "confirmed" },
                { status: "pending", expiresAt: { gt: new Date() } },
              ],
            },
          });
          if (existing) throw new Error("Already signed up");
        }

        // 📝 utworzenie zapisu
        const newSignup = await tx.trainingsSignup.create({
          data: {
            trainingId: training.id,
            userId: isGuest ? null : req.user.sub,
            status: "pending",
            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
            guestName: guestName || null,
            createdById: req.user.sub, // kto dodał
          },
          include: { user: true, training: true },
        });

        return newSignup;
      },
      { isolationLevel: "Serializable" }
    );

    io.emit("signup-created", { trainingId: Number(id), signup });
    res.status(201).json(signup);
  } catch (err) {
    const msg = err?.message || "Error";

    if (msg.includes("Training is full") || msg.includes("Already signed up")) {
      return res.status(400).json({ error: msg });
    }
    if (msg.includes("Zapisy rozpoczną się")) {
      return res.status(403).json({ error: msg });
    }

    res.status(500).json({ error: msg });
  }
});

router.patch("/:trainingId/signup/:signupId", ensureAuth, async (req, res) => {
  const { trainingId, signupId } = req.params;
  const { status } = req.body;

  if (!["pending", "confirmed"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const updatedSignup = await prisma.trainingsSignup.update({
      where: { id: Number(signupId) },
      data: { status },
      include: { user: true, training: true },
    });

    io.emit("signup-updated", {
      trainingId: Number(trainingId),
      signup: updatedSignup,
    });

    res.json(updatedSignup);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update signup" });
  }
});

router.get("/signups/me", ensureAuth, async (req, res) => {
  try {
    const signups = await prisma.trainingsSignup.findMany({
      where: {
        OR: [
          { userId: req.user.sub }, // Twoje własne zapisy
          { createdById: req.user.sub }, // Goście dodani przez Ciebie
        ],
      },
      include: {
        training: {
          include: {
            signups: { select: { id: true } }, // liczba zapisanych
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    const signupsWithGuestFlag = signups.map((s) => ({
      ...s,
      isGuest: !!s.guestName,
    }));

    res.json(signupsWithGuestFlag);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch signups" });
  }
});

/**
 * DELETE /api/trainings/:id
 * Usuwa trening wraz z zapisami (tylko autor może usunąć)
 */
router.delete("/:id", ensureAuth, ensureAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // znajdź trening
    const training = await prisma.training.findUnique({
      where: { id: Number(id) },
      include: { createdBy: true },
    });

    if (!training) {
      return res.status(404).json({ error: "Training not found" });
    }

    // usuwamy powiązane signups, a potem trening
    await prisma.$transaction([
      prisma.trainingsSignup.deleteMany({ where: { trainingId: training.id } }),
      prisma.training.delete({ where: { id: training.id } }),
    ]);

    // 🔔 powiadom klientów
    io.emit("training-deleted", { trainingId: training.id });

    res.json({ message: "Training deleted", trainingId: training.id });
  } catch (err) {
    console.error("Error deleting training:", err);
    res.status(500).json({ error: "Failed to delete training" });
  }
});

/**
 * DELETE /api/trainings/:trainingId/signup/:signupId
 * Usuwa zapis zawodnika, tylko jeśli trening jeszcze się nie rozpoczął
 */
router.delete("/:trainingId/signup/:signupId", ensureAuth, async (req, res) => {
  const { trainingId, signupId } = req.params;

  try {
    // znajdź trening
    const training = await prisma.training.findUnique({
      where: { id: Number(trainingId) },
    });

    if (!training) {
      return res.status(404).json({ error: "Training not found" });
    }

    // sprawdź, czy trening już się skończył
    if (new Date(training.endTime) <= new Date()) {
      return res
        .status(403)
        .json({
          error: "Nie można usuwać zawodników z zakończonych treningów",
        });
    }

    // znajdź zapis
    const signup = await prisma.trainingsSignup.findUnique({
      where: { id: Number(signupId) },
    });

    if (!signup) {
      return res.status(404).json({ error: "Signup not found" });
    }

    // uprawnienia: admin może każdego, user może swój zapis lub zapis swojego gościa
    const canDelete =
      req.user.isAdmin ||
      signup.userId === req.user.sub || // własny zapis
      signup.createdById === req.user.sub; // zapis gościa dodany przez usera

    if (!canDelete) {
      return res.status(403).json({ error: "Brak uprawnień" });
    }

    await prisma.trainingsSignup.delete({
      where: { id: Number(signupId) },
    });

    // 🔔 powiadom klientów
    io.emit("signup-deleted", {
      trainingId: Number(trainingId),
      signupId: Number(signupId),
    });

    res.json({ message: "Signup deleted", signupId: Number(signupId) });
  } catch (err) {
    console.error("Error deleting signup:", err);
    res.status(500).json({ error: "Failed to delete signup" });
  }
});

export default router;
