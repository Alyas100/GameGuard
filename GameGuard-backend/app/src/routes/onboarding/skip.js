import express from "express";
import prisma from "../../../../prismaClient.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const userId = Number(req.body.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        error: "userId is required.",
      });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { onboardingSkipped: true },
      select: {
        id: true,
        onboardingSkipped: true,
      },
    });

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("❌ Failed to skip onboarding:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to skip onboarding.",
    });
  }
});

export default router;
