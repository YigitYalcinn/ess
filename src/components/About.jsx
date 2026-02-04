import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FaShip, FaAward, FaClock } from 'react-icons/fa';
import './About.css';

const About = () => {
    const { t } = useTranslation();

    const features = [
        {
            icon: <FaShip size={48} />,
            title: t('about.experience.title'),
            text: t('about.experience.text')
        },
        {
            icon: <FaAward size={48} />,
            title: t('about.quality.title'),
            text: t('about.quality.text')
        },
        {
            icon: <FaClock size={48} />,
            title: t('about.service.title'),
            text: t('about.service.text')
        }
    ];

    return (
        <section id="about" className="section about">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="section-title">{t('about.title')}</h2>
                    <p className="section-subtitle">{t('about.subtitle')}</p>
                </motion.div>

                <div className="about-content">
                    <motion.div
                        className="about-text"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="about-description">
                            {t('about.description')}
                        </p>
                        <p
                            className="about-description"
                            dangerouslySetInnerHTML={{
                                __html: t('about.description2', {
                                    location: `<span class="about-highlight">${t('about.location_word')}</span>`,
                                    reliability: `<span class="about-highlight">${t('about.reliability_word')}</span>`,
                                    quality: `<span class="about-highlight">${t('about.quality_word')}</span>`
                                })
                            }}
                        />
                    </motion.div>

                    <motion.div
                        className="about-image"
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <img
                            src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=1200&q=80"
                            alt="Ship Supply"
                        />
                    </motion.div>
                </div>

                <div className="features-grid">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="feature-card"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2, duration: 0.6 }}
                        >
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.text}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default About;
