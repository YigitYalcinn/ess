export const LANGS = ['tr', 'en', 'ru'];
export const DEFAULT_LANG = 'tr';
export const POSTS_PER_PAGE = 12;

export function siteUrl() {
  return (process.env.SITE_URL || 'https://www.erayshipsupply.com').replace(/\/+$/, '');
}

// Bir dilin blog ana sayfa yolu: /blog, /en/blog, /ru/blog
export function blogBase(lang) {
  return lang === DEFAULT_LANG ? '/blog' : `/${lang}/blog`;
}

export function postPath(lang, slug) {
  return `${blogBase(lang)}/${slug}`;
}

export const UI = {
  tr: {
    locale: 'tr-TR',
    ogLocale: 'tr_TR',
    blogTitle: 'Blog',
    blogHeading: 'Blog',
    blogIntro: 'Gemi tedariki, hırdavat, bağlantı elemanları ve denizcilik sektörüne dair yazılar.',
    blogMetaTitle: 'Blog | Eray Ship Supply — Tuzla Gemi Tedarik',
    blogMetaDesc: 'Eray Ship Supply blogu: gemi tedariki, hırdavat, cıvata, bağlantı elemanları ve denizcilik sektörüyle ilgili rehberler ve haberler.',
    nav: { home: 'Ana Sayfa', about: 'Hakkımızda', products: 'Ürünlerimiz', contact: 'İletişim', blog: 'Blog' },
    readMore: 'Devamını oku',
    back: 'Tüm yazılar',
    empty: 'Henüz yazı yayınlanmadı. Yakında burada olacağız.',
    minRead: (n) => `${n} dk okuma`,
    prev: 'Önceki',
    next: 'Sonraki',
    page: (n) => `Sayfa ${n}`,
    ctaTitle: 'Gemi tedarik ihtiyacınız mı var?',
    ctaText: 'Tuzla’da 7/24 hızlı tedarik için bize ulaşın.',
    ctaButton: 'İletişime geç',
    notFoundTitle: 'Sayfa bulunamadı',
    notFoundText: 'Aradığınız yazı kaldırılmış ya da adresi değişmiş olabilir.',
    rights: 'Tüm hakları saklıdır.',
    footerDesc: 'Tuzla’da gemi tedarik, hırdavat ve teknik malzeme çözümleri.',
  },
  en: {
    locale: 'en-GB',
    ogLocale: 'en_US',
    blogTitle: 'Blog',
    blogHeading: 'Blog',
    blogIntro: 'Articles on ship supply, hardware, fasteners and the maritime industry.',
    blogMetaTitle: 'Blog | Eray Ship Supply — Ship Chandler in Tuzla',
    blogMetaDesc: 'The Eray Ship Supply blog: guides and news on ship supply, hardware, bolts, fasteners and the maritime industry in Tuzla, Istanbul.',
    nav: { home: 'Home', about: 'About', products: 'Products', contact: 'Contact', blog: 'Blog' },
    readMore: 'Read more',
    back: 'All articles',
    empty: 'No articles yet. Check back soon.',
    minRead: (n) => `${n} min read`,
    prev: 'Previous',
    next: 'Next',
    page: (n) => `Page ${n}`,
    ctaTitle: 'Need ship supplies?',
    ctaText: 'Contact us for fast 24/7 supply in Tuzla.',
    ctaButton: 'Get in touch',
    notFoundTitle: 'Page not found',
    notFoundText: 'The article you are looking for may have been removed or moved.',
    rights: 'All rights reserved.',
    footerDesc: 'Ship supply, hardware and technical materials in Tuzla.',
  },
  ru: {
    locale: 'ru-RU',
    ogLocale: 'ru_RU',
    blogTitle: 'Блог',
    blogHeading: 'Блог',
    blogIntro: 'Статьи о снабжении судов, метизах, крепеже и морской отрасли.',
    blogMetaTitle: 'Блог | Eray Ship Supply — шипчандлер в Тузле',
    blogMetaDesc: 'Блог Eray Ship Supply: руководства и новости о снабжении судов, метизах, болтах, крепеже и морской отрасли в Тузле, Стамбул.',
    nav: { home: 'Главная', about: 'О нас', products: 'Продукция', contact: 'Контакты', blog: 'Блог' },
    readMore: 'Читать далее',
    back: 'Все статьи',
    empty: 'Статей пока нет. Загляните позже.',
    minRead: (n) => `${n} мин чтения`,
    prev: 'Назад',
    next: 'Вперёд',
    page: (n) => `Страница ${n}`,
    ctaTitle: 'Нужно снабжение судна?',
    ctaText: 'Свяжитесь с нами для быстрого снабжения 24/7 в Тузле.',
    ctaButton: 'Связаться',
    notFoundTitle: 'Страница не найдена',
    notFoundText: 'Статья, которую вы ищете, могла быть удалена или перемещена.',
    rights: 'Все права защищены.',
    footerDesc: 'Снабжение судов, метизы и технические материалы в Тузле.',
  },
};
