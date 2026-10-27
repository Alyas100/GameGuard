import "dotenv/config";
import prisma from "../prismaClient.js";
import { updateAllGameScores } from "../app/src/bg-process/score-report/update_game_scores.js";

try {
  await updateAllGameScores();
} catch (error) {
  console.error("Failed to update game scores:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
