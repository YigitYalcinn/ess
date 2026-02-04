import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import './Header.css';

const Header = () => {
    const { t, i18n } = useTranslation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
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

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        document.documentElement.lang = lang;
    };

    return (
        <motion.header
            className={`header ${scrolled ? 'scrolled' : ''}`}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            <div className="container header-content">
                <button className="logo" onClick={() => scrollToSection('home')} type="button">
                    <img src="/brands/eray-logo.png" alt="Eray Ship Supply" className="logo-image" />
                    <span className="logo-text">ERAY SHIP SUPPLY</span>
                </button>

                <nav className="nav">
                    <a onClick={() => scrollToSection('home')}>{t('nav.home')}</a>
                    <a onClick={() => scrollToSection('about')}>{t('nav.about')}</a>
                    <a onClick={() => scrollToSection('products')}>{t('nav.products')}</a>
                    <a onClick={() => scrollToSection('contact')}>{t('nav.contact')}</a>
                </nav>

                <div className="language-switcher">
                    <button
                        className={i18n.language === 'tr' ? 'active' : ''}
                        onClick={() => changeLanguage('tr')}
                    >
                        TR
                    </button>
                    <button
                        className={i18n.language === 'en' ? 'active' : ''}
                        onClick={() => changeLanguage('en')}
                    >
                        EN
                    </button>
                    <button
                        className={i18n.language === 'ru' ? 'active' : ''}
                        onClick={() => changeLanguage('ru')}
                    >
                        RU
                    </button>
                </div>
            </div>
        </motion.header>
    );
};

export default Header;
