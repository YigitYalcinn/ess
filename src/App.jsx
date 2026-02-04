import './i18n/config';
import SEO from './components/SEO';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Brands from './components/Brands';
import Products from './components/Products';
import Contact from './components/Contact';
import Footer from './components/Footer';
import './index.css';

function App() {
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
