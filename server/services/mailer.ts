import nodemailer, { type Transporter } from 'nodemailer';

let _transport: Transporter | null = null;

function getTransport(): Transporter {
  if (_transport) return _transport;
  _transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    secure: parseInt(process.env.SMTP_PORT ?? '587', 10) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return _transport;
}

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

interface MailResult {
  sent: boolean;
  messageId: string;
}

export async function sendMail({ to, subject, html }: MailOptions): Promise<MailResult> {
  const fromName = process.env.MAIL_FROM_NAME ?? 'AmaliTech NSP Reviews';
  const fromAddr = process.env.MAIL_FROM_ADDRESS ?? process.env.SMTP_USER;
  const cc = process.env.CC_EMAIL;

  const info = await getTransport().sendMail({ from: `"${fromName}" <${fromAddr}>`, to, cc, subject, html });
  return { sent: true, messageId: info.messageId };
}
