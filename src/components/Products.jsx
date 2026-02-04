import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBolt, FaTools, FaShieldAlt, FaBox, FaWrench, FaSprayCan, FaAnchor } from 'react-icons/fa';
import './Products.css';

const Products = () => {
    const { t } = useTranslation();
    const [activeCategory, setActiveCategory] = useState('all');

    const categories = [
        { id: 'all', icon: <FaBox />, name: t('products.all') },
        { id: 'fasteners', icon: <FaBolt />, name: t('products.categories.fasteners.title') },
        { id: 'hand_tools', icon: <FaTools />, name: t('products.categories.hand_tools.title') },
        { id: 'safety', icon: <FaShieldAlt />, name: t('products.categories.safety.title') },
        { id: 'cleaning', icon: <FaSprayCan />, name: t('products.categories.cleaning.title') },
        { id: 'deck_equipment', icon: <FaAnchor />, name: t('products.categories.deck_equipment.title') }
    ];

    const products = [
        {
            id: 1,
            category: 'fasteners',
            title: t('products.categories.fasteners.title'),
            description: t('products.categories.fasteners.description'),
            icon: <FaBolt size={40} />,
            image: '/images/fasteners.png'
        },
        {
            id: 2,
            category: 'hand_tools',
            title: t('products.categories.hand_tools.title'),
            description: t('products.categories.hand_tools.description'),
            icon: <FaTools size={40} />,
            image: '/images/hand_tools.jpg'
        },
        {
            id: 3,
            category: 'safety',
            title: t('products.categories.safety.title'),
            description: t('products.categories.safety.description'),
            icon: <FaShieldAlt size={40} />,
            image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80'
        },
        {
            id: 4,
            category: 'cleaning',
            title: t('products.categories.cleaning.title'),
            description: t('products.categories.cleaning.description'),
            icon: <FaSprayCan size={40} />,
            image: '/images/cleaning.jpg'
        },
        {
            id: 5,
            category: 'deck_equipment',
            title: t('products.categories.deck_equipment.title'),
            description: t('products.categories.deck_equipment.description'),
            icon: <FaAnchor size={40} />,
            image: '/images/deck_equipment.jpg'
        }
    ];

    const filteredProducts = activeCategory === 'all'
        ? products
        : products.filter(p => p.category === activeCategory);

    return (
        <section id="products" className="section products">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="section-title">{t('products.title')}</h2>
                    <p className="section-subtitle">{t('products.subtitle')}</p>
                </motion.div>

                {/* Category Filter */}
                <motion.div
                    className="category-filter"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {categories.map((category, index) => (
                        <motion.button
                            key={category.id}
                            className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                            onClick={() => setActiveCategory(category.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <span className="category-icon">{category.icon}</span>
                            <span className="category-name">{category.name}</span>
                        </motion.button>
                    ))}
                </motion.div>

                {/* Product Grid */}
                <div className="products-grid">
                    <AnimatePresence mode="wait">
                        {filteredProducts.map((product, index) => (
                            <motion.div
                                key={product.id}
                                className="product-card premium-card"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                layout
                            >
                                <div className="product-image-wrapper">
                                    <img src={product.image} alt={product.title} className="product-image" />
                                    <div className="product-overlay">
                                        <div className="product-icon-large">{product.icon}</div>
                                    </div>
                                </div>
                                <div className="product-content">
                                    <h3 className="product-title">{product.title}</h3>
                                    <p className="product-description">{product.description}</p>
                                    <button className="product-link">
                                        <FaWrench size={16} />
                                        <span>{t('products.details')}</span>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

export default Products;
