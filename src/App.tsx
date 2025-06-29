import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Products from './components/Products';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import CustomerSupport from './components/CustomerSupport';

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'products', 'about', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (section: string) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Get products count for search bar
  const products = [
    { id: 1, name: 'Plain Chilli Powder', searchKeywords: ['chilli', 'chili', 'red', 'hot', 'spicy', 'heat', 'powder'], description: 'Pure, aromatic chilli powder made from the finest red chillies. Perfect for adding heat and flavor to any dish.', features: [{ text: '100% Natural' }, { text: 'No Preservatives' }, { text: 'Premium Quality' }, { text: 'Traditional Recipe' }] },
    { id: 2, name: 'Curry Powder', searchKeywords: ['curry', 'blend', 'aromatic', 'spices', 'masala', 'powder'], description: 'A perfect blend of aromatic spices that brings authentic curry flavors to your kitchen. Versatile and full of taste.', features: [{ text: 'Signature Blend' }, { text: 'Aromatic Spices' }, { text: 'Fresh Ground' }, { text: 'Family Recipe' }] },
    { id: 3, name: 'Kobbari Karam', searchKeywords: ['kobbari', 'coconut', 'karam', 'south indian', 'rice', 'idli', 'dosa', 'traditional'], description: 'Traditional coconut-based spice mix with aromatic ingredients. A perfect accompaniment for rice, idli, and dosa with authentic South Indian flavors.', features: [{ text: 'Coconut Base' }, { text: 'Traditional Mix' }, { text: 'Authentic Taste' }, { text: 'South Indian' }] },
    { id: 4, name: 'Nalla Karam', searchKeywords: ['nalla', 'karam', 'tamarind', 'garlic', 'tangy', 'sour', 'spicy', 'rice'], description: 'A rich and tangy spice blend made with premium tamarind, garlic, and aromatic spices. Perfect for enhancing rice dishes and traditional meals with its distinctive sour-spicy flavor.', features: [{ text: 'Tamarind Rich' }, { text: 'Garlic Blend' }, { text: 'Traditional Mix' }, { text: 'Aromatic Spices' }] },
    { id: 5, name: 'Turmeric Root Powder', searchKeywords: ['turmeric', 'haldi', 'yellow', 'root', 'health', 'curcumin', 'powder'], description: 'Premium quality turmeric powder made from fresh turmeric roots. Known for its vibrant color, earthy flavor, and health benefits.', features: [{ text: 'Fresh Ground' }, { text: 'High Curcumin' }, { text: 'Vibrant Color' }, { text: 'Health Benefits' }] }
  ];

  // Filter products based on search term
  const filteredProducts = React.useMemo(() => {
    if (!searchTerm.trim()) return products;

    const searchLower = searchTerm.toLowerCase().trim();
    
    return products.filter(product => {
      // Search in product name
      if (product.name.toLowerCase().includes(searchLower)) return true;
      
      // Search in description
      if (product.description.toLowerCase().includes(searchLower)) return true;
      
      // Search in keywords
      if (product.searchKeywords.some(keyword => 
        keyword.toLowerCase().includes(searchLower)
      )) return true;
      
      // Search in features
      if (product.features.some(feature => 
        feature.text.toLowerCase().includes(searchLower)
      )) return true;
      
      return false;
    });
  }, [searchTerm, products]);

  return (
    <div className="min-h-screen bg-white">
      <Header activeSection={activeSection} onNavClick={handleNavClick} />
      <Hero 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        resultsCount={filteredProducts.length}
        totalCount={products.length}
        filteredProducts={filteredProducts}
      />
      <Products searchTerm={searchTerm} />
      <About />
      <Contact />
      <Footer />
      <CustomerSupport />
    </div>
  );
}

export default App;