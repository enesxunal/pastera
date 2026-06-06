# Resend + Supabase — hızlı kurulum (pastera.de)

## 1. Resend hesabı

1. [resend.com](https://resend.com) → Sign up (ücretsiz)
2. **Domains** → **Add Domain** → `pastera.de`

## 2. DNS kayıtları

Resend 3–4 kayıt verir (SPF, DKIM vb.). **DNS nerede yönetiliyorsa oraya** ekle:

### Vercel’de DNS ise
Vercel → Proje → **Settings** → **Domains** → `pastera.de` → DNS Records → Resend’in verdiği kayıtları ekle

### Namecheap’te DNS ise
Namecheap → Domain List → pastera.de → **Advanced DNS** → Resend kayıtlarını ekle

5–30 dk bekleyin → Resend’de domain **Verified** olmalı.

## 3. API Key

Resend → **API Keys** → **Create API Key** → isim: `supabase` → kopyala (bir daha gösterilmez)

## 4. Supabase SMTP

Supabase → **Project Settings** → **Authentication** → **SMTP Settings** → **Enable Custom SMTP**

| Alan | Değer |
|------|--------|
| Sender email | `noreply@pastera.de` |
| Sender name | `Pastera` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | Resend API Key (3. adım) |

**Save**

## 5. Rate limit (önemli)

Supabase → **Authentication** → **Rate Limits** → **Email sent** → en az **30–100** yap → Save

## 6. Test

1. Supabase → Authentication → Users → eski test kullanıcıyı sil (isteğe bağlı)
2. pastera.de → kayıt ol
3. Resend → **Emails** sekmesinde mail görünmeli

## 7. Sipariş mailleri (otomatik)

Şube panelinde sipariş durumu değişince müşteriye mail gider (hesaplı siparişler).

Vercel’e ekle:
- `RESEND_API_KEY` — Resend API Keys (SMTP ile aynı anahtar)
- `PASTERA_EMAIL_FROM` — `Pastera <noreply@pastera.de>`

Supabase SQL Editor’da bir kez çalıştır: `supabase/migrations/20250606_order_email_followup.sql`

### Yorum maili (Google + Instagram) — sonra

Vercel **Hobby** planda cron en fazla **günde 1 kez** çalışır. Teslimden 1 saat sonra yorum maili için Pro plan veya harici cron gerekir. Kod hazır: `/api/cron/order-followup` — şimdilik `vercel.json`’da kapalı.

## Sorun çıkarsa

- Domain Verified değil → DNS kayıtlarını kontrol et
- Mail gitmiyor → Supabase SMTP şifresi = API Key mi?
- Hâlâ rate limit → Rate Limits’i artır, 1 saat bekle
