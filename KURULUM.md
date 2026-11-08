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

## 3. Claude API anahtarı al (otomatik çeviri için)

Panelde "EN + RU çevir" butonuna basınca yazı Claude'a gönderilir ve çevrilir.

1. https://console.anthropic.com adresinden hesap aç.
2. **Billing** bölümünden kart ekleyip **5 $ kredi** yükle. Kullandıkça düşer, abonelik değildir.
   Bir blog yazısının iki dile çevirisi yaklaşık **0,05-0,15 $** tutar, yani 5 $ onlarca yazıya yeter.
3. **Billing → Limits** bölümünden aylık harcama limiti koy (örn. 5 $). Böylece sürpriz fatura çıkmaz.
4. **API Keys → Create Key** ile anahtar oluştur (`sk-ant-...`). Anahtar sadece bir kez gösterilir, kopyala.

> claude.ai'daki Pro/Max aboneliği bu anahtarı **kapsamaz**. API ayrı ücretlendirilir.
> Anahtar girilmezse panel yine çalışır: EN/RU sekmelerinde "Elle yaz" ile çeviriler elle girilebilir.
> İstersen Claude yerine `DEEPL_API_KEY` (DeepL Free, ücretsiz) de kullanılabilir. İkisi birden varsa Claude kullanılır.

## 4. Vercel ortam değişkenleri

Vercel → proje → **Settings → Environment Variables**. Hepsini **Production + Preview** için ekle:

| İsim | Değer | Nereden? |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase → Project Settings → API (Data API) → Project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (anon / publishable key) | Aynı sayfa |
| `SUPABASE_URL` | yukarıdaki URL'nin aynısı | |
| `SUPABASE_ANON_KEY` | yukarıdaki anon key'in aynısı | |
| `SITE_URL` | `https://www.erayshipsupply.com` | |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | 3. adım |

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
- **Otomatik çeviri iyi ama kusursuz değildir.** Özellikle teknik terimlerde (cıvata sınıfları, ürün adları) EN/RU sekmelerine kısaca göz atmak iyi olur.
- **Yayındaki bir yazının URL'sini değiştirmek** eski linkleri bozar. Panel bu konuda uyarı gösteriyor.
- Panel adresi (`/admin`) arama motorlarına kapalıdır (`noindex` ve robots.txt).

## Dosyalar

| Dosya | Görevi |
|---|---|
| `supabase/schema.sql` | Veritabanı, güvenlik kuralları, görsel klasörü |
| `api/blog.js` | Blog liste ve yazı sayfaları (sunucuda HTML) |
| `api/sitemap.js` | `/sitemap.xml` |
| `api/translate.js` | Claude ile otomatik çeviri (sadece yetkili kullanıcılar) |
| `api/_lib/*` | Ortak kod: sayfa şablonu, metinler, veritabanı okuma, slug |
| `public/blog.css` | Blog sayfalarının tasarımı |
| `admin.html`, `src/admin/*` | Yönetim paneli |
| `vercel.json` | Adres yönlendirmeleri |
