import {
  PASTERA_EMAIL_COLORS as C,
  pasteraLogoUrl,
} from "@/lib/email/brand";

type EmailLayoutOptions = {
  siteUrl: string;
  title: string;
  greeting?: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryHtml?: string;
};

export function renderPasteraEmail(opts: EmailLayoutOptions): string {
  const logo = pasteraLogoUrl(opts.siteUrl);
  const greeting = opts.greeting
    ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${C.muted};">${opts.greeting}</p>`
    : "";

  const cta =
    opts.ctaLabel && opts.ctaHref
      ? `<p style="margin:28px 0 0;text-align:center;">
          <a href="${opts.ctaHref}"
             style="display:inline-block;background:${C.gold};color:#0a0a0a;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 28px;border-radius:999px;border:2px solid ${C.green};">
            ${opts.ctaLabel}
          </a>
        </p>`
      : "";

  const secondary = opts.secondaryHtml
    ? `<div style="margin-top:24px;padding-top:20px;border-top:2px solid ${C.green};">${opts.secondaryHtml}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${opts.title}</title>
</head>
<body style="margin:0;padding:0;background:${C.bg};font-family:Arial,Helvetica,sans-serif;color:${C.text};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${C.bg};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:2px solid ${C.green};">
          <tr>
            <td style="background:${C.green};padding:24px 32px;text-align:center;">
              <img src="${logo}" alt="Pastera" width="160" style="display:block;margin:0 auto;max-width:160px;height:auto;" />
              <p style="margin:10px 0 0;font-size:13px;color:${C.greenLight};">Pasta · mehr</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;background:${C.card};">
              <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:${C.green};">${opts.title}</h1>
              ${greeting}
              <div style="font-size:15px;line-height:1.6;color:${C.muted};">${opts.bodyHtml}</div>
              ${cta}
              ${secondary}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;border-top:2px solid ${C.green};background:${C.bg};">
              <p style="margin:0;font-size:12px;line-height:1.6;color:${C.muted};">
                <a href="${opts.siteUrl}" style="color:${C.green};font-weight:bold;text-decoration:none;">pastera.de</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderDualButtonRow(
  left: { label: string; href: string },
  right: { label: string; href: string },
): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:8px;">
    <tr>
      <td align="center" style="padding:6px;">
        <a href="${left.href}"
           style="display:inline-block;background:${C.gold};color:#0a0a0a;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 20px;border-radius:999px;border:2px solid ${C.green};">
          ${left.label}
        </a>
      </td>
      <td align="center" style="padding:6px;">
        <a href="${right.href}"
           style="display:inline-block;background:${C.green};color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 20px;border-radius:999px;">
          ${right.label}
        </a>
      </td>
    </tr>
  </table>`;
}
