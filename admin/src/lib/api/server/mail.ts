import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';
import type { Role } from '@/lib/auth/roles';
import { ROLE_LABELS } from '@/lib/auth/roles';

export interface SendResult {
  sent: boolean;
  error: string | null;
}

let transporter: Transporter | null = null;

/**
 * SMTP transport built from env (the same SMTP server configured in Supabase).
 * Returns null when SMTP isn't configured so callers can degrade gracefully.
 */
function getTransport(): Transporter | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  if (!transporter) {
    const port = Number(process.env.SMTP_PORT ?? 587);
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465,
      auth: { user, pass },
    });
  }
  return transporter;
}

async function sendMail(opts: { to: string; subject: string; html: string; text: string }): Promise<SendResult> {
  const t = getTransport();
  if (!t) {
    return {
      sent: false,
      error: 'SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and MAIL_FROM in admin/.env.local.',
    };
  }
  const from = process.env.MAIL_FROM ?? process.env.SMTP_USER!;
  try {
    await t.sendMail({ from, to: opts.to, subject: opts.subject, text: opts.text, html: opts.html });
    return { sent: true, error: null };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : 'Failed to send email.' };
  }
}

/** Email a newly added member their sign-in link + credentials. */
export async function sendMemberInvite(params: {
  to: string;
  password: string;
  role: Role;
  loginUrl: string;
}): Promise<SendResult> {
  const { to, password, role, loginUrl } = params;
  const roleLabel = ROLE_LABELS[role];

  const text = [
    'You have been given access to the Dreammy admin.',
    '',
    `Sign in: ${loginUrl}`,
    `Email: ${to}`,
    `Password: ${password}`,
    `Role: ${roleLabel}`,
  ].join('\n');

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #3a2b3f; line-height: 1.6;">
      <h2 style="color: #b83280;">Welcome to Dreammy Admin</h2>
      <p>You have been given access to the Dreammy admin. Use the details below to sign in.</p>
      <p style="margin: 20px 0;">
        <a href="${loginUrl}" style="background:#b83280;color:#fff;padding:10px 20px;border-radius:9999px;text-decoration:none;font-weight:bold;">Sign in</a>
      </p>
      <table style="border-collapse: collapse;">
        <tr><td style="padding:2px 12px 2px 0;color:#8a7a8f;">Sign-in link</td><td><a href="${loginUrl}">${loginUrl}</a></td></tr>
        <tr><td style="padding:2px 12px 2px 0;color:#8a7a8f;">Email</td><td><strong>${to}</strong></td></tr>
        <tr><td style="padding:2px 12px 2px 0;color:#8a7a8f;">Password</td><td><strong>${password}</strong></td></tr>
        <tr><td style="padding:2px 12px 2px 0;color:#8a7a8f;">Role</td><td>${roleLabel}</td></tr>
      </table>
      <p style="color:#8a7a8f;font-size:12px;margin-top:24px;">Keep these credentials private.</p>
    </div>
  `;

  return sendMail({ to, subject: 'Your Dreammy Admin access', html, text });
}
