import { Resend } from "resend";
import { pasteraEmailFrom } from "@/lib/email/brand";

let client: Resend | null = null;

export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY?.trim();
}

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  if (!client) client = new Resend(key);
  return client;
}

export async function sendPasteraEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const resend = getClient();
  if (!resend) {
    return { ok: false, error: "resend_not_configured" };
  }

  const to = input.to.trim();
  if (!to) return { ok: false, error: "no_recipient" };

  try {
    const { error } = await resend.emails.send({
      from: pasteraEmailFrom(),
      to,
      subject: input.subject,
      html: input.html,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "send_failed";
    return { ok: false, error: message };
  }
}
