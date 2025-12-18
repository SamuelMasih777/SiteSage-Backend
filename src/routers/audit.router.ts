import express, { Request, Response } from "express";
import auditController from "../controllers/audit.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

// All routes are protected with auth middleware
router.use(authMiddleware);

/**
 * @swagger
 * /api/audits:
 *   post:
 *     summary: Create new SEO audit(s)
 *     tags: [Audits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuditRequest'
 *     responses:
 *       200:
 *         description: Audits completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AuditResponse'
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post("/", async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { urls, crawlerMode, generatePdf, customPrompt } = req.body;

  const data = await auditController.createAudit(userId, {
    urls,
    crawlerMode,
    generatePdf,
    customPrompt,
  });

  res.status(data.status).send(data);
});

/**
 * @swagger
 * /api/audits/{id}:
 *   get:
 *     summary: Get audit by ID
 *     tags: [Audits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Audit ID
 *     responses:
 *       200:
 *         description: Audit details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                 data:
 *                   $ref: '#/components/schemas/AuditResponse'
 *       404:
 *         description: Audit not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const auditId = req.params.id;

  const data = await auditController.getAuditById(userId, auditId);
  res.status(data.status).send(data);
});

/**
 * @swagger
 * /api/audits:
 *   get:
 *     summary: Get user's audits
 *     tags: [Audits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of audits to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of audits to skip
 *     responses:
 *       200:
 *         description: List of audits
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AuditResponse'
 *       401:
 *         description: Unauthorized
 */
router.get("/", async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = parseInt(req.query.offset as string) || 0;

  const data = await auditController.getUserAudits(userId, limit, offset);
  res.status(data.status).send(data);
});

export default router;
