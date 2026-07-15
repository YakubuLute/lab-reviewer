import { Router, type Request, type Response, type NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { sendMail } from '../services/mailer.js';

const router = Router();
router.use(requireAuth);

const HTML_SIZE_LIMIT = 512 * 1024; // 512 KB — well above any legit review email

interface SendEmailBody {
  to?: string;
  cc?: string;
  subject?: string;
  html?: string;
}

router.post('/send-email', async (req: Request<object, object, SendEmailBody>, res: Response, next: NextFunction) => {
  try {
    const { to, cc, subject, html } = req.body;

    if (!to || typeof to !== 'string') { res.status(400).json({ error: '"to" is required' }); return; }
    if (!subject || typeof subject !== 'string') { res.status(400).json({ error: '"subject" is required' }); return; }
    if (!html || typeof html !== 'string') { res.status(400).json({ error: '"html" is required' }); return; }
    if (html.length > HTML_SIZE_LIMIT) { res.status(400).json({ error: 'Email body too large' }); return; }

    const ccAddr = cc?.trim() || undefined;
    const result = await sendMail({ to: to.trim().toLowerCase(), cc: ccAddr, subject, html });
    res.json(result);
  } catch (err) {
    const e = err as Error & { status?: number };
    if (!e.status) {
      e.status = 502;
      e.message = `Email sending failed: ${e.message}`;
    }
    next(e);
  }
});

export default router;
