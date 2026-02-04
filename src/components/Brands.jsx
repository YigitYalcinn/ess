import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import './Brands.css';

const Brands = () => {
    const { t } = useTranslation();

    const brands = [
        { name: 'Askaynak', logo: '/brands/askaynak.png' },
        { name: 'Baymax', logo: '/brands/baymax.png' },
        { name: 'Beybi', logo: '/brands/beybi.png' },
        { name: 'Bosch', logo: '/brands/bosch.png' },
        { name: 'Dewalt', logo: '/brands/dewalt.png' },
        { name: 'İzeltaş', logo: '/brands/izeltas.png' },
        { name: 'Ingco', logo: '/brands/ingco.png' },
        { name: 'Karbosan', logo: '/brands/karbosan.png' },
        { name: 'Stanley', logo: '/brands/stanley.png' },
        { name: 'Starline', logo: '/brands/starline.jpg' },
        { name: 'Geka', logo: '/brands/geka.png' },
        { name: 'Varta', logo: '/brands/varta.jpg' },
        { name: 'Winkel', logo: '/brands/winkel.webp' },
        { name: 'Alcon', logo: '/brands/alcon.jpg' },
        { name: 'Best', logo: '/brands/best.jpg' }
    ];

    return (
        <section className="section brands">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="section-title">{t('brands.title')}</h2>
                    <p className="section-subtitle">{t('brands.subtitle')}</p>
                </motion.div>

                <div className="brands-grid">
                    {brands.map((brand, index) => (
                        <motion.div
                            key={brand.name}
                            className="brand-card premium-card"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05, duration: 0.4 }}
                        >
                            <div className="brand-logo-wrapper">
                                <img src={brand.logo} alt={brand.name} className="brand-logo" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    className="brands-note"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                >
                    <p>{t('brands.note')}</p>
                </motion.div>
            </div>
        </section>
    );
};

export default Brands;
