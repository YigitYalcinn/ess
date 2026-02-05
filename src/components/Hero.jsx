import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import './Hero.css';

const Hero = () => {
    const { t } = useTranslation();

    const scrollToContact = () => {
        const element = document.getElementById('contact');
        if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const scrollToProducts = () => {
        const element = document.getElementById('products');
        if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section id="home" className="hero">
            {/* Hidden SEO keywords per-language */}
            <div style={{position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden'}} aria-hidden="true">
                {t('seo.keywords')}
            </div>
            <div className="hero-background">
                <video
                    className="hero-video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-hidden="true"
                >
                    <source src="/images/bgvid.mp4" type="video/mp4" />
                </video>
                <div className="hero-pattern"></div>
            </div>

            <div className="container hero-content">
                <motion.h1
                    className="hero-title"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    {t('hero.title')}
                </motion.h1>

                <motion.h2
                    className="hero-mobile-title"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    {t('hero.title')}
                </motion.h2>

                <motion.h2
                    className="hero-subtitle"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    {t('hero.subtitle')}
                </motion.h2>

                <motion.p
                    className="hero-description"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                >
                    {t('hero.description')}
                </motion.p>

                <motion.div
                    className="hero-cta"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1 }}
                >
                    <button className="btn btn-primary" onClick={scrollToContact}>
                        {t('hero.cta')}
                    </button>
                    <button className="btn btn-secondary" onClick={scrollToProducts}>
                        {t('nav.products')}
                    </button>
                </motion.div>

                <motion.div
                    className="hero-stats"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1.2 }}
                >
                    <div className="stat-item">
                        <span className="stat-number">15+</span>
                        <span className="stat-label">{t('about.experience.text')}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">3000+</span>
                        <span className="stat-label">{t('products.title')}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">24/7</span>
                        <span className="stat-label">{t('about.service.text')}</span>
                    </div>
                </motion.div>
            </div>

        </section>
    );
};

export default Hero;

