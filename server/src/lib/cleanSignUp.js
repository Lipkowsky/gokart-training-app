import cron from "node-cron";
import { prisma } from "./prisma.js";

// Cron co 5 minut
export const startCleanupCron = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      const result = await prisma.trainingsSignup.deleteMany({
        where: {
          status: "pending",
          expiresAt: { lt: new Date() }, // przeterminowane
        },
      });

      if (result.count > 0) {
        console.log(`🗑️ Usunięto ${result.count} przeterminowanych zapisów`);
      }
    } catch (err) {
      console.error("Błąd podczas czyszczenia przeterminowanych zapisów:", err);
    }
  });
};
