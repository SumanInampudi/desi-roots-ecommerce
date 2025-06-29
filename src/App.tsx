import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';
import { PaymentProvider } from './hooks/usePayment';
import Header from './components/Header';
import Hero from './components/Hero';
import Products from './components/Products';
import Testimonials from './components/Testimonials';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import CustomerSupport from './components/CustomerSupport';
import ProfileSettings from './components/auth/ProfileSettings';
import AuthCallback from './components/auth/AuthCallback';
import ProtectedRoute from './components/auth/ProtectedRoute';
import CartDrawer from './components/cart/CartDrawer';
import CartIcon from './components/cart/CartIcon';
import CheckoutPage from './components/payment/CheckoutPage';
import PaymentSuccess from './components/payment/PaymentSuccess';

function HomePage() {
  const [activeSection, setActiveSection] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'checkout' | 'success'>('home');
  const [successOrderId, setSuccessOrderId] = useState<string>('');

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

  const handleCheckout = () => {
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSuccess = (orderId: string) => {
    setSuccessOrderId(orderId);
    setCurrentView('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get products count for search bar
  const products = [
    { 
      id: 1, 
      name: 'Plain Chilli Powder', 
      price: '250',
      weight: '500gm',
      rating: 5,
      reviewCount: 127,
      searchKeywords: ['chilli', 'chili', 'red', 'hot', 'spicy', 'heat', 'powder'], 
      description: 'Pure, aromatic chilli powder made from the finest red chillies. Perfect for adding heat and flavor to any dish.', 
      image: '/WhatsApp Image 2025-06-28 at 4.25.25 PM.jpeg',
      features: [{ text: '100% Natural' }, { text: 'No Preservatives' }, { text: 'Premium Quality' }, { text: 'Traditional Recipe' }] 
    },
    { 
      id: 2, 
      name: 'Curry Powder', 
      price: '200',
      weight: '500gm',
      rating: 5,
      reviewCount: 89,
      searchKeywords: ['curry', 'blend', 'aromatic', 'spices', 'masala', 'powder'], 
      description: 'A perfect blend of aromatic spices that brings authentic curry flavors to your kitchen. Versatile and full of taste.', 
      image: '/WhatsApp Image 2025-06-28 at 4.10.33 PM copy.jpeg',
      features: [{ text: 'Signature Blend' }, { text: 'Aromatic Spices' }, { text: 'Fresh Ground' }, { text: 'Family Recipe' }] 
    },
    { 
      id: 3, 
      name: 'Kobbari Karam', 
      price: '300',
      weight: '500gm',
      rating: 5,
      reviewCount: 156,
      searchKeywords: ['kobbari', 'coconut', 'karam', 'south indian', 'rice', 'idli', 'dosa', 'traditional'], 
      description: 'Traditional coconut-based spice mix with aromatic ingredients. A perfect accompaniment for rice, idli, and dosa with authentic South Indian flavors.', 
      image: '/WhatsApp Image 2025-06-28 at 5.39.30 PM.jpeg',
      features: [{ text: 'Coconut Base' }, { text: 'Traditional Mix' }, { text: 'Authentic Taste' }, { text: 'South Indian' }] 
    },
    { 
      id: 4, 
      name: 'Nalla Karam', 
      price: '280',
      weight: '500gm',
      rating: 5,
      reviewCount: 203,
      searchKeywords: ['nalla', 'karam', 'tamarind', 'garlic', 'tangy', 'sour', 'spicy', 'rice'], 
      description: 'A rich and tangy spice blend made with premium tamarind, garlic, and aromatic spices. Perfect for enhancing rice dishes and traditional meals with its distinctive sour-spicy flavor.', 
      image: '/Nalla Karam.jpeg',
      features: [{ text: 'Tamarind Rich' }, { text: 'Garlic Blend' }, { text: 'Traditional Mix' }, { text: 'Aromatic Spices' }] 
    },
    { 
      id: 5, 
      name: 'Turmeric Root Powder', 
      price: '250',
      weight: '500gm',
      rating: 5,
      reviewCount: 94,
      searchKeywords: ['turmeric', 'haldi', 'yellow', 'root', 'health', 'curcumin', 'powder'], 
      description: 'Premium quality turmeric powder made from fresh turmeric roots. Known for its vibrant color, earthy flavor, and health benefits.', 
      image: '/WhatsApp Image 2025-06-28 at 4.09.58 PM (1).jpeg',
      features: [{ text: 'Fresh Ground' }, { text: 'High Curcumin' }, { text: 'Vibrant Color' }, { text: 'Health Benefits' }] 
    }
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
      {/* Header with Cart Integration */}
      <Header 
        activeSection={activeSection} 
        onNavClick={handleNavClick}
        onCartClick={() => setIsCartOpen(true)}
      />

      {/* Floating Cart Icon */}
      <CartIcon 
        onClick={() => setIsCartOpen(true)} 
        variant="floating"
      />

      {/* Main Content */}
      {currentView === 'home' && (
        <>
          <Hero 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            resultsCount={filteredProducts.length}
            totalCount={products.length}
            filteredProducts={filteredProducts}
          />
          <Products searchTerm={searchTerm} />
          <Testimonials />
          <About />
          <Contact />
          <Footer />
          <CustomerSupport />
        </>
      )}

      {currentView === 'checkout' && (
        <CheckoutPage
          onBack={handleBackToHome}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {currentView === 'success' && (
        <PaymentSuccess
          orderId={successOrderId}
          onContinueShopping={handleBackToHome}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <PaymentProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfileSettings />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Router>
        </PaymentProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;