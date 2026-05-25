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
| `ADMIN_PASSWORD` | Admin panel şifresi |
| `BRANCH_PANEL_PASSWORD` | Şube panel şifresi |
| `DISPLAY_ACCESS_KEY` | Mutfak ekranı anahtarı |
| `BRANCH_PANEL_BRANCH_ID` | Varsayılan şube UUID |
| `CRON_SECRET` | Yedekleme cron güvenliği |

İsteğe bağlı: `LOBBY_ACCESS_KEY`, `NEXT_PUBLIC_RECEIPT_WIDTH_MM`

## Kontrol

Deploy sonrası site açılıyorsa ve girişte kırmızı “Supabase ortam değişkenleri” uyarısı **yoksa** ayar tamamdır.
