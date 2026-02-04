import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer = () => {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container footer-content">
                <div className="footer-info">
                    <h3>Eray Ship Supply</h3>
                    <p>{t('footer.description')}</p>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {currentYear} Eray Ship Supply. {t('footer.rights')}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
