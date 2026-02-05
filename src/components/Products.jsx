import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaBolt,
    FaTools,
    FaShieldAlt,
    FaBox,
    FaSprayCan,
    FaAnchor,
    FaFire,
    FaCogs,
    FaIndustry,
    FaVials,
    FaTint,
    FaProjectDiagram,
    FaPlug,
    FaDraftingCompass
} from 'react-icons/fa';
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
        { id: 'deck_equipment', icon: <FaAnchor />, name: t('products.categories.deck_equipment.title') },
        { id: 'welding', icon: <FaFire />, name: t('products.categories.welding.title') },
        { id: 'crane_service', icon: <FaCogs />, name: t('products.categories.crane_service.title') },
        { id: 'manhole_covers', icon: <FaIndustry />, name: t('products.categories.manhole_covers.title') },
        { id: 'ship_chemicals', icon: <FaVials />, name: t('products.categories.ship_chemicals.title') },
        { id: 'hydraulic', icon: <FaTint />, name: t('products.categories.hydraulic.title') },
        { id: 'valves_pipes', icon: <FaProjectDiagram />, name: t('products.categories.valves_pipes.title') },
        { id: 'electrical', icon: <FaPlug />, name: t('products.categories.electrical.title') },
        { id: 'cnc_lathe', icon: <FaDraftingCompass />, name: t('products.categories.cnc_lathe.title') }
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
            image: '/images/safety.jpg'
        },
        {
            id: 4,
            category: 'cleaning',
            title: t('products.categories.cleaning.title'),
            description: t('products.categories.cleaning.description'),
            icon: <FaSprayCan size={40} />,
            image: '/images/cleaning.webp'
        },
        {
            id: 5,
            category: 'deck_equipment',
            title: t('products.categories.deck_equipment.title'),
            description: t('products.categories.deck_equipment.description'),
            icon: <FaAnchor size={40} />,
            image: '/images/deck_equipment.jpg'
        },
        {
            id: 6,
            category: 'welding',
            title: t('products.categories.welding.title'),
            description: t('products.categories.welding.description'),
            icon: <FaFire size={40} />,
            image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80'
        },
        {
            id: 7,
            category: 'crane_service',
            title: t('products.categories.crane_service.title'),
            description: t('products.categories.crane_service.description'),
            icon: <FaCogs size={40} />,
            image: '/images/vinc.jpg'
        },
        {
            id: 8,
            category: 'manhole_covers',
            title: t('products.categories.manhole_covers.title'),
            description: t('products.categories.manhole_covers.description'),
            icon: <FaIndustry size={40} />,
            image: '/images/menhol.png'
        },
        {
            id: 9,
            category: 'ship_chemicals',
            title: t('products.categories.ship_chemicals.title'),
            description: t('products.categories.ship_chemicals.description'),
            icon: <FaVials size={40} />,
            image: '/images/chem.jpg'
        },
        {
            id: 10,
            category: 'hydraulic',
            title: t('products.categories.hydraulic.title'),
            description: t('products.categories.hydraulic.description'),
            icon: <FaTint size={40} />,
            image: '/images/hidrolik.jpeg'
        },
        {
            id: 11,
            category: 'valves_pipes',
            title: t('products.categories.valves_pipes.title'),
            description: t('products.categories.valves_pipes.description'),
            icon: <FaProjectDiagram size={40} />,
            image: '/images/valf.png'
        },
        {
            id: 12,
            category: 'electrical',
            title: t('products.categories.electrical.title'),
            description: t('products.categories.electrical.description'),
            icon: <FaPlug size={40} />,
            image: '/images/electric.jpg'
        },
        {
            id: 13,
            category: 'cnc_lathe',
            title: t('products.categories.cnc_lathe.title'),
            description: t('products.categories.cnc_lathe.description'),
            icon: <FaDraftingCompass size={40} />,
            image: '/images/torna.jpg'
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
