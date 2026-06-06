# Pastera — Supabase e-posta şablonları

Supabase’in varsayılan mailleri soğuk görünür. Aşağıdaki şablonları panelden yapıştırarak **Pastera markalı** hale getirebilirsiniz.

## Nereden düzenlenir?

1. [supabase.com](https://supabase.com) → projeniz  
2. **Authentication** → **Email Templates**  
3. Soldan şablon seçin (en çok **Confirm signup** kullanılır)  
4. **Subject** ve **Body** alanlarını aşağıdakiyle değiştirin  
5. **Save**

## Daha profesyonel gönderen adresi (isteğe bağlı)

**Project Settings → Authentication → SMTP Settings** bölümünden kendi SMTP’nizi bağlayın (ör. domain sağlayıcınız, Resend, SendGrid).

| Alan | Örnek |
|------|--------|
| Sender email | `info@pastera.de` |
| Sender name | `Pastera` |

SMTP yoksa mailler `noreply@mail.app.supabase.io` gibi bir adresten gider — şablon yine de markalı olur.

---

## 1. Confirm signup (Kayıt onayı)

**Subject:**
```
Willkommen bei Pastera — bitte E-Mail bestätigen
```

**Body (HTML):**
```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Pastera</title>
</head>
<body style="margin:0;padding:0;background:#eef3dc;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef3dc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:2px solid #2e402a;">
          <tr>
            <td style="background:#2e402a;padding:24px 32px;text-align:center;">
              <img src="https://pastera.de/pastera-Logo-beyaz.png" alt="Pastera" width="160" style="display:block;margin:0 auto;max-width:160px;height:auto;" />
              <p style="margin:10px 0 0;font-size:13px;color:#b8cc78;">Pasta · mehr</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;background:#fafcf5;">
              <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#2e402a;">Willkommen!</h1>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#555;">
                Schön, dass du dabei bist. Bitte bestätige deine E-Mail-Adresse, damit du bestellen, Adressen speichern und dein Konto nutzen kannst.
              </p>
              <p style="margin:0 0 28px;text-align:center;">
                <a href="{{ .ConfirmationURL }}"
                   style="display:inline-block;background:#c49746;color:#0a0a0a;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 28px;border-radius:999px;border:2px solid #2e402a;">
                  E-Mail bestätigen
                </a>
              </p>
              <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#666;">
                Button funktioniert nicht? Link in den Browser kopieren:
              </p>
              <p style="margin:0;font-size:12px;line-height:1.5;word-break:break-all;color:#888;">
                {{ .ConfirmationURL }}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;border-top:2px solid #2e402a;background:#eef3dc;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#555;">
                Du hast dich nicht registriert? Diese E-Mail ignorieren.<br />
                <a href="https://pastera.de" style="color:#2e402a;font-weight:bold;text-decoration:none;">pastera.de</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2. Reset password (Şifre sıfırlama)

**Subject:**
```
Pastera — Passwort zurücksetzen
```

**Body:** Confirm signup ile aynı yapı; sadece metinleri değiştirin:

- Başlık: `Passwort vergessen?`
- Metin: `Klicke auf den Button, um ein neues Passwort zu setzen. Der Link ist nur kurze Zeit gültig.`
- Buton: `Neues Passwort setzen`
- Link: `{{ .ConfirmationURL }}` (aynı kalır)

---

## 3. Magic link (Sihirli giriş linki — kullanıyorsanız)

**Subject:**
```
Pastera — Anmeldelink
```

Buton metni: `Jetzt anmelden` — link yine `{{ .ConfirmationURL }}`.

---

## Önemli notlar

- `{{ .ConfirmationURL }}` satırını **silin veya değiştirmeyin** — Supabase bu değişkeni doldurur.
- Şablonu kaydettikten sonra **yeni bir test kaydı** yapın; eski mailler eski şablonla gitmiş olabilir.
- Site URL ve Redirect URLs doğru olmalı (`https://pastera.de/auth/callback`) — bkz. `VERCEL-ORTAM.md`.

## Türkçe mail ister misiniz?

Supabase şablon başına **tek dil** destekler. Almanca site için yukarıdaki Almanca şablon uygundur. Türkçe ayrı şablon için ya SMTP + farklı akış gerekir ya da metinde iki dil birlikte yazılabilir (kısa TR cümle footer’da).
