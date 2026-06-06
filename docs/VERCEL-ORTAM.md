# Vercel ortam değişkenleri

Giriş ve veritabanı çalışması için bilgisayarınızdaki `.env.local` içeriğini Vercel’e **aynı isimlerle** eklemeniz gerekir.

## Adımlar

1. [vercel.com](https://vercel.com) → projeniz → **Settings** → **Environment Variables**
2. Her satır için **Name** = değişken adı, **Value** = `.env.local` içindeki değer
3. **Production**, **Preview** ve **Development** için işaretleyin → Save
4. **Deployments** → son deploy → **⋯** → **Redeploy** (değişkenler build’e girsin)

## Zorunlu değişkenler

| Name | Açıklama |
|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (gizli) |
| `ADMIN_PASSWORD` | Admin panel şifresi (**zorunlu** — yoksa /admin girişi çalışmaz) |
| `BRANCH_PANEL_PASSWORD` | Şube panel şifresi |
| `DISPLAY_ACCESS_KEY` | Mutfak ekranı anahtarı |
| `BRANCH_PANEL_BRANCH_ID` | Varsayılan şube UUID |
| `CRON_SECRET` | Yedekleme cron güvenliği |
| `NEXT_PUBLIC_SITE_URL` | Canlı site adresi — **https://pastera.de** (kayıt onay maili için zorunlu) |

İsteğe bağlı: `LOBBY_ACCESS_KEY`, `NEXT_PUBLIC_RECEIPT_WIDTH_MM`, PayPal değişkenleri

## Supabase — kayıt onay maili (localhost gelmesin)

Supabase Dashboard → **Authentication** → **URL Configuration**:

| Alan | Değer |
|------|--------|
| **Site URL** | `https://pastera.de` |
| **Redirect URLs** | `https://pastera.de/auth/callback` |
| | `http://localhost:3000/auth/callback` (yerel geliştirme) |

Kaydettikten sonra Vercel’de `NEXT_PUBLIC_SITE_URL=https://pastera.de` ekleyip **Redeploy** edin.

Eski onay maillerindeki localhost linki çalışmaz — **yeniden kayıt olun** veya Supabase’den kullanıcıyı silip tekrar deneyin.

## Kontrol

Tarayıcıda açın (kendi Vercel adresiniz):

`https://SİTE-ADINIZ.vercel.app/api/setup-status`

Hepsi `true` olmalı. Örnek:

```json
{"supabaseUrl":true,"supabaseAnon":true,"serviceRole":true,...}
```

`false` görürseniz: değişken adını kontrol edin, **Production + Preview** işaretli mi bakın, sonra **Redeploy** (mümkünse “Clear build cache”).

## Sık yapılan hatalar

1. Değişkenleri eklediniz ama **yeniden deploy etmediniz** — Vercel eski sürümü çalıştırır.
2. Sadece **Production** işaretli; siz **Preview** linkini açıyorsunuz (`…-enesxunals-projects.vercel.app`).
3. İsimde yazım hatası: `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon, anonim anahtar).
