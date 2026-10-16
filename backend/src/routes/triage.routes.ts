
import { Router } from "express";
import { z } from "zod";

const router = Router();

const requestSchema = z.object({
  symptoms: z.array(z.string().trim().min(1)).min(1).max(30),
  severity: z.number().int().min(1).max(10).default(5),
  has_red_flags: z.boolean().default(false),
});

router.post("/", async (req, res) => {
  const parsed = requestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid triage request.",
    });
  }

  try {
    const mlUrl =
      process.env.TRIAGE_ML_SERVICE_URL || "http://127.0.0.1:8000";

    const response = await fetch(`${mlUrl}/triage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(10000),
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status === 400 ? 400 : 502).json({
        success: false,
        message: result?.detail || "ML service error.",
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
      notice:
        "Synthetic demo model only; this is not a medical diagnosis.",
    });
  } catch {
    return res.status(503).json({
      success: false,
      message: "ML triage service is unavailable.",
    });
  }
});

export default router;
