# Pastera VIP Club - Windows 11 NFC Kasa Kurulum Rehberi (Claude)

Bu rehber Windows 11'deki Claude'a verilmek üzere hazırlandı. Kaynak depo:
**https://github.com/enesxunal/pastera**

## Amaç

Pastera'nın USB NFC okuyucusunu Windows 11'de kullanarak **canlı** `https://www.pastera.de/admin/vip/pos` kasa ekranını otomatik güncellemek. Her **ayrı kart fiziksel sunumu** +1 VIP siparişi sayar; kart sürekli okuyucunun üzerindeyken tekrarlamaz. **10 geçerli siparişte** `Herzlichen Glückwunsch! Du hast eine Gratis-Pasta verdient!` mesajı çıkar. Telefonla NFC okutma yalnız müşterinin VIP web ekranını açar, asla puan vermez.

**Mevcut gerçek durum:** Site ve /vip ile /admin/vip/pos üretimde. Veritabanında 200 VIP kart var. Ancak `VIP-0001` son kontrolde `unassigned` ve `uid_hex = null`. Vercel Production'da `VIP_NFC_TERMINAL_SECRET` ve `ADMIN_SESSION_SECRET` değişkenleri son kontrolde bulunmuyordu. Bunlar doğrulanmadan "canlı okutma çalışıyor" denmemeli.

## 1. Git ve Python

Windows 11 PowerShell'de `git --version` ve `py -3 --version` ile kurulumları denetle. Eksikse güvenilir paket yöneticisi veya resmi siteler üzerinden Git ve Python 3 yükle:

- Git: https://git-scm.com/download/win
- Python: https://www.python.org/downloads/windows/

Bu NFC yardımcı programı **üçüncü taraf Python paketi gerektirmez**. Python standart kütüphanesi ve Windows'un yerleşik `winscard.dll` API'sini kullanır. Windows Smart Card (Akıllı Kart) hizmetinin ve USB NFC okuyucunun Windows Aygıt Yöneticisi'nde çalıştığını denetle.

PowerShell:

```powershell
git clone https://github.com/enesxunal/pastera.git
cd .\pastera\scripts
py -3 .\vip-nfc-windows.py --mode inspect
```

Depo özel ise kullanıcıdan GitHub erişimini/oturumunu iste. Parola, gizli anahtar veya token'ı ekrana/loga dökme.

## 2. Önce salt-okunur cihaz testi

USB NFC okuyucuyu bağla, kartı okut. `--mode inspect` çıktısında `UID: XXXXX...` görülmeli. Kartı kaldırıp tekrar koyunca yeni UID okuması olmalı. Programı `Ctrl+C` ile kapat.

Tek tuşla görsel test için `PASTERA-VIP-WINDOWS11-TEST.cmd` dosyasını çalıştır. Tarayıcıda `http://127.0.0.1:8765/` açılır; her fiziksel okutma sayacı ve 10. okutma Almanca kutlaması görünür. **Bu mod gerçek puan yazmaz.** Windows programının konsolu açık kalmalıdır. Sekme kendi kendine USB'yi dinleyemez.

Kart okuyucu bulunamazsa Aygıt Yöneticisi, Akıllı Kart hizmeti, uyumlu PC/SC sürücüsü ve `FF CA 00 00 00` UID komutunun desteğini incele. Okuyucu normal klavye-HID okuyucu ise bu program doğrudan kullanılamayabilir; cihaz modeline göre uyarlamak gerekir.

## 3. Kartın iki farklı bilgisi

- **Kartın NDEF URL'si** (telefonların okuduğu web bağlantısı) ayrı yazılır. Kullanıcı `VIP-0001` için daha önce `/vip/card/<public_token>` biçimindeki özel URL'yi karta yazdı. Kod veya UID ile URL'yi birbirine karıştırma; URL okutması puan yazmaz.
- **Kartın donanımsal UID'si** Windows PC/SC okuyucusunun okuduğu hex kimliktir. Bu değer Pastera yönetici panelinde kart numarası ve mevcut müşteri hesabı ile eşleştirilmelidir. `UID` değerini **tahmin etme**; bağlı okuyucudan tekrar doğrula.

Önceden okunmuş herhangi bir UID değerini güncel kartın UID'si olarak varsayma.

## 4. Canlıya güvenli bağlama

1. Windows'da yönetici hesabıyla **https://www.pastera.de/admin/login** sayfasına giriş yap. Parola unutulduysa, proje sahibinin Vercel `ADMIN_PASSWORD` değerini güvenli biçimde değiştirmesi ve production redeploy yapması gerekir; **parolayı Claude sohbetine yazdırma**.
2. **https://www.pastera.de/admin/vip** adresinde `VIP-0001` kartını, bilgisayarda okunan güncel UID ve kullanıcı tarafından doğrulanmış mevcut test profiliyle ilişkilendir. Mevcut Black/Gold üyeliği ve P Coin bakiyesine dokunma.
3. Pastera Vercel projesinin Production ortamına güçlü, rastgele ve yalnızca kasa cihazı ile sunucu arasında paylaşılan `VIP_NFC_TERMINAL_SECRET` değişkenini ekle. Üretim `ADMIN_SESSION_SECRET` değişkenini de güvenli olarak ayarla. Değişkenler yayıma alınana kadar gerçek puan yazımı için test sonucu başarılı sayılmamalıdır. Gizli değerleri GitHub'a, `.env` takip edilen dosyalara veya çıktıya ekleme; gerekliyse yalnız kullanıcının güvenli Vercel panelinden gir.
4. Production redeploy sonrası /admin/vip/pos sekmesini Windows Chrome/Edge'de aç; yönetici oturumu korunmalı.
5. Windows'da `PASTERA-VIP-WINDOWS11-KASA.cmd` dosyasını başlat. Program terminal anahtarını **gizli giriş** alanında ister (ayrıca komut satırında görünmez), `https://www.pastera.de` API'sine HTTPS ile gönderir ve kiosk sekmesini açar.
6. İlk okutmayı kontrol et: konsolda sunucu onayını ve kasa ekranında **+1 Bestellung** değişimini gör. Kartı kaldırıp tekrar koy: **+2** olmalı. Yanlış test puanlarını yönetici panelinde geri al; iade/geri alma geçmişinin denetim kaydı tutulmalı.

**Canlı müşteri verisine yazma yapmadan önce kullanıcıyla test hesabının hangisi olduğunu doğrula ve yetkilendirme adımlarını tamamla.** Supabase'e toplu kayıt, yeniden migration veya ücretli/gerçek müşteri satış simülasyonu yapma.

## 5. Sorun giderme

- **"No Windows PC/SC smart card reader found"**: USB, sürücü, Smart Card hizmeti, cihaz türü.
- **Kart algılanıyor ama UID okunmuyor**: Kart protokolü/okuyucu modelini kontrol et; bu kod PC/SC `FF CA 00 00 00` kullanır.
- **UID okunuyor fakat canlı puan yok**: Kart henüz hesabına atanmamış olabilir veya `VIP_NFC_TERMINAL_SECRET` üretimde ayarlı değildir.
- **Web sekmesi açık ama hareket yok**: Sekme tek başına USB okuyucusuna erişemez; konsolda çalışan NFC yardımcı programı gerekli.
- **Telefon URL'yi açıyor ama VIP hesabı görünmüyor**: Kullanıcı oturumu, kartın user_id ile eşleştirilmesi ve özel token eşleşmesi incelenmeli.
- **Yalnızca görsel testte hareket var**: `browser-test` puan yazmaz. Canlı için `pos` modu gerekir.
- **10. okutmadaki kutlama yok**: Sunucunun `availableRewards > 0` ve `progress` değerlerini kontrol et.

## Claude için başarı ölçütleri

1. Windows 11'de okuyucu ve kart UID'si **gerçek donanımda** görüldü.
2. `PASTERA-VIP-WINDOWS11-TEST.cmd` yerel tarayıcıyı açıp kart okutmalarında güncelliyor.
3. Canlı yönetici ekranı `https://www.pastera.de/admin/vip/pos` açıldı.
4. `VIP-0001` kullanıcının mevcut hesabına eşleştirildi ve canlı sunucuda doğru UID ile doğrulandı.
5. Yetkilendirilmiş gerçek iki ayrı okutma sonucunda +1, +2 görünür; yanlış puanlar güvenle geri alınır.
6. Kartın telefonla okunması yalnızca VIP sayfasını açar.
7. 10. geçerli damgada Almanca kutlama çıkar.
8. Hangi testlerin başarılı/engelli olduğu kullanıcıya açıkça rapor edilir; gizli değerler paylaşılmaz.

Dosyalar: `scripts/vip-nfc-windows.py` (okuyucu), `scripts/PASTERA-VIP-WINDOWS11-TEST.cmd` (yerel deneme), `scripts/PASTERA-VIP-WINDOWS11-KASA.cmd` (canlı kasa), `src/app/api/admin/vip/scan/route.ts` (sunucu), `src/app/admin/vip/pos/page.tsx` (kasa web ekranı).
