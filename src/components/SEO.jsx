import { useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const SEO = () => {
    const { t, i18n } = useTranslation();

    useEffect(() => {
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);

    const seoData = {
        tr: {
            title: t('seo.title'),
            description: t('seo.description'),
            keywords: t('seo.keywords'),
            ogLocale: 'tr_TR'
        },
        en: {
            title: t('seo.title'),
            description: t('seo.description'),
            keywords: t('seo.keywords'),
            ogLocale: 'en_US'
        },
        ru: {
            title: t('seo.title'),
            description: t('seo.description'),
            keywords: t('seo.keywords'),
            ogLocale: 'ru_RU'
        }
    };

    const currentSEO = seoData[i18n.language] || seoData.tr;

    return (
        <HelmetProvider>
            <Helmet>
                {/* Primary Meta Tags */}
                <title>{currentSEO.title}</title>
                <meta name="title" content={currentSEO.title} />
                <meta name="description" content={currentSEO.description} />
                <meta name="keywords" content={currentSEO.keywords} />
                <meta name="robots" content="index, follow" />
                <meta name="language" content={i18n.language.toUpperCase()} />
                <meta name="author" content="Eray Ship Supply" />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={currentSEO.title} />
                <meta property="og:description" content={currentSEO.description} />
                <meta property="og:locale" content={currentSEO.ogLocale} />
                <meta property="og:site_name" content="Eray Ship Supply" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:title" content={currentSEO.title} />
                <meta property="twitter:description" content={currentSEO.description} />

                {/* Structured Data - Organization */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": "Eray Ship Supply",
                        "description": currentSEO.description,
                        "url": "https://www.erayshipsupply.com",
                        "address": {
                            "@type": "PostalAddress",
                            "addressLocality": "Tuzla",
                            "addressRegion": "Istanbul",
                            "addressCountry": "TR"
                        },
                        "contactPoint": {
                            "@type": "ContactPoint",
                            "contactType": "customer service",
                            "telephone": "+90-XXX-XXX-XX-XX",
                            "email": "info@erayshipsupply.com"
                        }
                    })}
                </script>

                {/* Structured Data - LocalBusiness */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "LocalBusiness",
                        "name": "Eray Ship Supply",
                        "image": "https://www.erayshipsupply.com/logo.png",
                        "description": currentSEO.description,
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "Tuzla",
                            "addressLocality": "Istanbul",
                            "addressCountry": "TR"
                        },
                        "geo": {
                            "@type": "GeoCoordinates",
                            "latitude": "40.8167",
                            "longitude": "29.2833"
                        },
                        "telephone": "+90-XXX-XXX-XX-XX",
                        "openingHours": "Mo-Sa 08:00-18:00",
                        "priceRange": "$$"
                    })}
                </script>
            </Helmet>
        </HelmetProvider>
    );
};

export default SEO;
