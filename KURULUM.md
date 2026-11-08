# Blog + Yönetim Paneli Kurulumu

Bu rehber, blogu canlıya almak için **bir kere** yapılacak adımları anlatır. Toplamda 20-30 dakika sürer.

## Nasıl çalışıyor?

```
SEO'cu arkadaş ──► erayshipsupply.com/admin  (e-posta + şifre ile giriş)
                     │  Türkçe yazar → EN/RU çevirilerini yapıştırır → "Yayınla"
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
   - Site URL: `https://www.erayshipsupply.com/admin` (sonunda `/admin` olmalı: davet ve şifre sıfırlama e-postaları buraya yönlenir)
   - Redirect URLs listesine şunu ekle: `https://www.erayshipsupply.com/admin`

## 2. SEO'cu arkadaşı davet et

Arkadaşının sadece **e-posta adresi** gerekiyor. Şifresini o kendisi belirler, sen hiç bilmezsin.

1. **Authentication → Users → Add user → Send invitation** (ya da "Invite user"). Arkadaşının e-postasını gir.
2. Hemen ardından **SQL Editor**'de şunu çalıştır (e-postayı değiştir):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'arkadasin@mail.com';
   ```
   Bu adım olmadan arkadaşın giriş yapabilir ama "Yetki yok" ekranı görür.
3. Arkadaşına gelen e-postadaki linke tıklar, panel açılır ve **"Yeni şifre"** ekranında kendi şifresini belirler. Sonraki girişlerde `erayshipsupply.com/admin` adresinden e-posta ve şifresiyle girer.
   - E-posta gelmezse **spam klasörüne** baksın. Supabase'in ücretsiz e-posta servisi saatte birkaç e-postayla sınırlı ve bazen spam'e düşüyor.
   - Hiç gelmezse plan B: **Add user → Create new user** ile geçici bir şifre koy (**Auto Confirm User** işaretli), şifreyi ona ilet, o da girince sağ üstten **"Şifre değiştir"** desin.

Kendine de hesap açmak istersen aynı adımları kendi e-postanla tekrarla.

## 3. Çeviriler (şimdilik elle)

Panelde **TR / EN / RU** sekmeleri var. Türkçe zorunlu. EN ve RU sekmelerine çeviriler elle yazılır veya yapıştırılır. Boş bırakılan dilde yazı yayınlanmaz, diğer dillerde görünür.

**İleride otomatik çeviri istersen:** kod hazır. Vercel'e `ANTHROPIC_API_KEY` (console.anthropic.com, ücretli, yazı başına birkaç sent) ya da `DEEPL_API_KEY` (DeepL API Free, ücretsiz) ve `VITE_TRANSLATION` = `on` ekleyip yeniden deploy etmen yeterli. Panelde "EN + RU çevir" butonu belirir.

## 4. Vercel ortam değişkenleri

Vercel → proje → **Settings → Environment Variables**. Hepsini **Production + Preview** için ekle:

| İsim | Değer | Nereden? |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase → Project Settings → API (Data API) → Project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (anon / publishable key) | Aynı sayfa |
| `SUPABASE_URL` | yukarıdaki URL'nin aynısı | |
| `SUPABASE_ANON_KEY` | yukarıdaki anon key'in aynısı | |
| `SITE_URL` | `https://www.erayshipsupply.com` | |

> ⚠️ **service_role** anahtarını ASLA buraya koyma. Bu sistem sadece anon key ile çalışır, güvenliği veritabanı kuralları sağlar.

Değişkenleri ekledikten sonra **Deployments → en son deploy → Redeploy** yap. `VITE_` ile başlayanlar derleme sırasında okunduğu için yeniden deploy şart.

## 5. Kontrol listesi

- [ ] `https://www.erayshipsupply.com/admin` adresinde giriş ekranı açılıyor
- [ ] Arkadaşın hesabıyla giriş yapılabiliyor
- [ ] Deneme yazısı TR + EN + RU olarak yazılıp yayınlanabiliyor
- [ ] "Yayınla" sonrası `/blog`, `/en/blog`, `/ru/blog` sayfalarında yazı görünüyor
- [ ] `https://www.erayshipsupply.com/sitemap.xml` açılıyor
- [ ] Google Search Console'a sitemap gönderildi (SEO'cu arkadaş yapar)

---

## Bilinmesi gerekenler

- **Supabase ücretsiz planı**, projede 7 gün boyunca hiç hareket olmazsa projeyi duraklatabiliyor. Blogda ziyaretçi trafiği oldukça bu genelde sorun olmaz, ama blog bir süre "Sayfa bulunamadı" gösterirse ilk bakılacak yer Supabase paneli: oradan tek tıkla geri açılıyor.
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
