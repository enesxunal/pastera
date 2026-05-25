# Pastera

Pastane sipariş ve şube yönetim paneli (Next.js + Supabase).

## Yerelde çalıştırma

```bash
cp .env.example .env.local
# .env.local dosyasını doldurun
npm install
npm run dev
```

Tarayıcı: [http://localhost:3000](http://localhost:3000)

## Vercel’e yayınlama

1. [GitHub deposu](https://github.com/enesxunal/pastera) → Vercel’de **Import Project**
2. Framework: **Next.js** (otomatik algılanır)
3. **Environment Variables** bölümüne `.env.example` içindeki tüm değişkenleri ekleyin (şifreleri canlı ortam için güçlü seçin)
4. Deploy sonrası site adresi: `https://proje-adiniz.vercel.app`

Günlük yedek cron’u `vercel.json` içinde tanımlıdır; Vercel’de `CRON_SECRET` mutlaka tanımlı olmalıdır.

## Ortam değişkenleri

Bkz. `.env.example` — `.env.local` dosyası Git’e **yüklenmez**.
