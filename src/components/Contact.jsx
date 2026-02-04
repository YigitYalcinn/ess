import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaWhatsapp } from 'react-icons/fa';
import './Contact.css';

const Contact = () => {
    const { t } = useTranslation();

    return (
        <section id="contact" className="section contact">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="section-title">{t('contact.title')}</h2>
                    <p className="section-subtitle">{t('contact.subtitle')}</p>
                </motion.div>

                <div className="contact-content">
                    <motion.div
                        className="contact-info-wrapper"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="info-card">
                            <div className="info-item">
                                <FaMapMarkerAlt className="info-icon" />
                                <div>
                                    <h4>{t('contact.info.address')}</h4>
                                    <p>{t('contact.address_text')}</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <FaPhone className="info-icon" />
                                <div>
                                    <h4>{t('contact.info.phone')}</h4>
                                    <p><a href="tel:+905323894529">+90 532 389 45 29</a></p>
                                </div>
                            </div>

                            <div className="info-item">
                                <FaEnvelope className="info-icon" />
                                <div>
                                    <h4>{t('contact.info.email')}</h4>
                                    <p><a href="mailto:info@erayshipsupply.com">info@erayshipsupply.com</a></p>
                                </div>
                            </div>

                            <div className="info-item">
                                <FaClock className="info-icon" />
                                <div>
                                    <h4>{t('contact.info.hours')}</h4>
                                    <p>{t('contact.hours_text')}</p>
                                </div>
                            </div>

                            <div className="info-item info-item-cta">
                                <a
                                    className="whatsapp-button"
                                    href="https://wa.me/905323894529"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <FaWhatsapp className="whatsapp-icon" />
                                    <span>{t('contact.whatsapp')}</span>
                                </a>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="contact-map">
                            <iframe
                                title="Eray Ship Supply Location"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d377.2914211159714!2d29.29554110006942!3d40.84264797278485!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14caddb6cdde9761%3A0xbd632d321d3be01f!2sEray%20Ship%20Supply!5e0!3m2!1str!2str!4v1770149489378!5m2!1str!2str"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <div className="contact-actions">
                            <a className="btn btn-primary" href="tel:+905323894529">
                                {t('contact.quick_call')}
                            </a>
                            <a className="btn btn-secondary" href="mailto:info@erayshipsupply.com">
                                {t('contact.quick_mail')}
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
