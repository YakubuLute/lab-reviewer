import nodemailer from 'nodemailer';

let _transport;

function getTransport() {
  if (_transport) return _transport;
  _transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return _transport;
}

/**
 * Send a report email.
 * @param {object} opts
 * @param {string} opts.to        Learner email (already validated by route)
 * @param {string} opts.subject
 * @param {string} opts.html      Full HTML email body
 * @returns {Promise<{sent: boolean, messageId: string}>}
 */
export async function sendMail({ to, subject, html }) {
  const fromName = process.env.MAIL_FROM_NAME || 'AmaliTech NSP Reviews';
  const fromAddr = process.env.MAIL_FROM_ADDRESS || process.env.SMTP_USER;
  const cc = process.env.CC_EMAIL;

  const info = await getTransport().sendMail({
    from: `"${fromName}" <${fromAddr}>`,
    to,
    cc,
    subject,
    html,
  });

  return { sent: true, messageId: info.messageId };
}
