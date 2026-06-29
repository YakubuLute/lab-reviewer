import { Router } from 'express';
import { ALLOWED_EMAILS } from '../../shared/learners.js';
import { sendMail } from '../services/mailer.js';

const router = Router();

router.post('/send-email', async (req, res, next) => {
  try {
    const { to, subject, html } = req.body;

    // Validate required fields
    if (!to || typeof to !== 'string') return res.status(400).json({ error: '"to" is required' });
    if (!subject || typeof subject !== 'string') return res.status(400).json({ error: '"subject" is required' });
    if (!html || typeof html !== 'string') return res.status(400).json({ error: '"html" is required' });

    // Safety guard: only allow emails to known learners
    if (!ALLOWED_EMAILS.has(to.trim().toLowerCase())) {
      return res.status(403).json({
        error: `"${to}" is not in the approved learner roster. Emails can only be sent to registered learners.`,
      });
    }

    // CC and From come from env only; the frontend cannot override them
    const result = await sendMail({ to: to.trim().toLowerCase(), subject, html });
    res.json(result);
  } catch (err) {
    // Nodemailer errors often have a message but no status
    if (!err.status) {
      err.status = 502;
      err.message = `Email sending failed: ${err.message}`;
    }
    next(err);
  }
});

export default router;
