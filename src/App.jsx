import './i18n/config';
import SEO from './components/SEO';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Brands from './components/Brands';
import Products from './components/Products';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { useEffect } from 'react';
import './index.css';

function App() {
  // Blogdan /#contact gibi bir bağlantıyla gelindiyse ilgili bölüme kaydır
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' });
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <SEO />
      <Header />
      <main>
        <Hero />
        <About />
        <Brands />
        <Products />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default App;
