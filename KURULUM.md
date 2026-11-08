# Blog + Yönetim Paneli Kurulumu

Bu rehber, blogu canlıya almak için **bir kere** yapılacak adımları anlatır. Toplamda 20-30 dakika sürer.

## Nasıl çalışıyor?

```
SEO'cu arkadaş ──► erayshipsupply.com/admin  (e-posta + şifre ile giriş)
                     │  Türkçe yazar → "EN + RU çevir" → kontrol eder → "Yayınla"
                     ▼
                 Supabase (veritabanı + görseller)
                     ▲
Ziyaretçi / Google ──► /blog, /en/blog, /ru/blog  (Vercel sunucuda hazır HTML üretir)
```

- **Adresler:** `/blog/yazi-adi` (TR), `/en/blog/post-name`, `/ru/blog/nazvanie`
- **SEO:** sayfalar sunucuda HTML olarak üretilir. Her yazıda canonical, hreflang (TR/EN/RU), Open Graph, BlogPosting ve Breadcrumb şemaları bulunur. `/sitemap.xml` otomatik güncellenir.
- **Yayın hızı:** yazı yayınlandıktan sonra en geç ~1 dakika içinde sitede görünür (önbellek süresi).

---

## 1. Supabase projesi aç (ücretsiz)

1. https://supabase.com adresinden hesap aç, **New project** de.
   - Region: **Central EU (Frankfurt)**. Türkiye'ye en yakın bölge bu.
   - Database şifresini bir yere kaydet.
2. Proje açılınca soldan **SQL Editor → New query**'yi aç. Repodaki `supabase/schema.sql` dosyasının tamamını yapıştır ve **Run**'a bas.
   - Bu adım tabloları, güvenlik kurallarını ve `blog-images` görsel klasörünü oluşturur.
3. **Authentication → Sign In / Providers** (ya da **Settings**) bölümünde **"Allow new users to sign up"** seçeneğini **KAPAT**. Böylece kimse kendi kendine hesap açamaz.
4. **Authentication → URL Configuration** bölümünde:
   - Site URL: `https://www.erayshipsupply.com`
   - Redirect URLs listesine şunu ekle: `https://www.erayshipsupply.com/admin`

## 2. SEO'cu arkadaşın hesabını oluştur

1. **Authentication → Users → Add user → Create new user**
   - E-postasını ve geçici bir şifre gir, **Auto Confirm User** kutusunu işaretle.
2. **SQL Editor**'de şunu çalıştır (e-postayı değiştir):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'arkadasin@mail.com';
   ```
   Kendine de hesap açmak istersen aynı iki adımı kendi e-postanla tekrarla.
3. Arkadaşın ilk girişten sonra sağ üstteki **"Şifre değiştir"** ile kendi şifresini belirlesin.

## 3. Çeviri anahtarı al (birini seç)

**Seçenek A: DeepL (önerilen, ücretsiz başlangıç)**
- https://www.deepl.com/pro-api adresinden **DeepL API Free** hesabı aç. Ayda 500.000 karakter ücretsiz, bu da kabaca 50-80 yazı eder.
- Kart bilgisi istiyor ama Free planda ücret kesmiyor.
- **Account → API Keys** bölümünden anahtarı kopyala (sonu `:fx` ile biter).

**Seçenek B: Claude API**
- https://console.anthropic.com adresinden anahtar al. Ücretlidir (yazı başına birkaç sent), ama denizcilik terimlerini ve SEO metinlerini daha doğal çevirir.

İkisi birden tanımlıysa DeepL kullanılır.

## 4. Vercel ortam değişkenleri

Vercel → proje → **Settings → Environment Variables**. Hepsini **Production + Preview** için ekle:

| İsim | Değer | Nereden? |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase → Project Settings → API (Data API) → Project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (anon / publishable key) | Aynı sayfa |
| `SUPABASE_URL` | yukarıdaki URL'nin aynısı | |
| `SUPABASE_ANON_KEY` | yukarıdaki anon key'in aynısı | |
| `SITE_URL` | `https://www.erayshipsupply.com` | |
| `DEEPL_API_KEY` | `xxxx:fx` | 3. adım (A) |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | 3. adım (B), DeepL kullanıyorsan gerek yok |

> ⚠️ **service_role** anahtarını ASLA buraya koyma. Bu sistem sadece anon key ile çalışır, güvenliği veritabanı kuralları sağlar.

Değişkenleri ekledikten sonra **Deployments → en son deploy → Redeploy** yap. `VITE_` ile başlayanlar derleme sırasında okunduğu için yeniden deploy şart.

## 5. Kontrol listesi

- [ ] `https://www.erayshipsupply.com/admin` adresinde giriş ekranı açılıyor
- [ ] Arkadaşın hesabıyla giriş yapılabiliyor
- [ ] Deneme yazısı → "EN + RU çevir" → çeviriler geliyor
- [ ] "Yayınla" sonrası `/blog`, `/en/blog`, `/ru/blog` sayfalarında yazı görünüyor
- [ ] `https://www.erayshipsupply.com/sitemap.xml` açılıyor
- [ ] Google Search Console'a sitemap gönderildi (SEO'cu arkadaş yapar)

---

## Bilinmesi gerekenler

- **Supabase ücretsiz planı**, projede 7 gün boyunca hiç hareket olmazsa projeyi duraklatabiliyor. Blogda ziyaretçi trafiği oldukça bu genelde sorun olmaz, ama blog bir süre "Sayfa bulunamadı" gösterirse ilk bakılacak yer Supabase paneli: oradan tek tıkla geri açılıyor.
- **Otomatik çeviri kusursuz değildir.** Özellikle teknik terimlerde (cıvata sınıfları, ürün adları) EN/RU sekmelerine kısaca göz atmak iyi olur.
- **Yayındaki bir yazının URL'sini değiştirmek** eski linkleri bozar. Panel bu konuda uyarı gösteriyor.
- Panel adresi (`/admin`) arama motorlarına kapalıdır (`noindex` ve robots.txt).

## Dosyalar

| Dosya | Görevi |
|---|---|
| `supabase/schema.sql` | Veritabanı, güvenlik kuralları, görsel klasörü |
| `api/blog.js` | Blog liste ve yazı sayfaları (sunucuda HTML) |
| `api/sitemap.js` | `/sitemap.xml` |
| `api/translate.js` | Otomatik çeviri (sadece yetkili kullanıcılar) |
| `api/_lib/*` | Ortak kod: sayfa şablonu, metinler, veritabanı okuma, slug |
| `public/blog.css` | Blog sayfalarının tasarımı |
| `admin.html`, `src/admin/*` | Yönetim paneli |
| `vercel.json` | Adres yönlendirmeleri |
