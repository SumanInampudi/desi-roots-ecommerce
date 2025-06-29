import React, { useMemo } from 'react';
import { MessageCircle, Award, Leaf, Shield, Star } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AddToCartButton from './cart/AddToCartButton';
import QuantitySelector from './cart/QuantitySelector';
import CartNotification from './cart/CartNotification';
import AuthModal from './auth/AuthModal';
import NoResults from './NoResults';

interface ProductsProps {
  searchTerm: string;
}

const Products: React.FC<ProductsProps> = ({ searchTerm }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [quantities, setQuantities] = React.useState<Record<number, number>>({});
  const [notification, setNotification] = React.useState<{
    show: boolean;
    productName: string;
    quantity: number;
  }>({ show: false, productName: '', quantity: 0 });
  
  const { isAuthenticated } = useAuth();

  const products = [
    {
      id: 1,
      name: 'Plain Chilli Powder',
      price: '250',
      weight: '500gm',
      rating: 5,
      reviewCount: 127,
      description: 'Pure, aromatic chilli powder made from the finest red chillies. Perfect for adding heat and flavor to any dish.',
      image: '/WhatsApp Image 2025-06-28 at 4.25.25 PM.jpeg',
      searchKeywords: ['chilli', 'chili', 'red', 'hot', 'spicy', 'heat', 'powder'],
      features: [
        { text: '100% Natural', icon: <Leaf className="w-3 h-3" />, color: 'bg-green-100 text-green-800' },
        { text: 'No Preservatives', icon: <Shield className="w-3 h-3" />, color: 'bg-blue-100 text-blue-800' },
        { text: 'Premium Quality', icon: <Award className="w-3 h-3" />, color: 'bg-purple-100 text-purple-800' },
        { text: 'Traditional Recipe', icon: <Star className="w-3 h-3" />, color: 'bg-amber-100 text-amber-800' }
      ]
    },
    {
      id: 2,
      name: 'Curry Powder',
      price: '200',
      weight: '500gm',
      rating: 5,
      reviewCount: 89,
      description: 'A perfect blend of aromatic spices that brings authentic curry flavors to your kitchen. Versatile and full of taste.',
      image: '/WhatsApp Image 2025-06-28 at 4.10.33 PM copy.jpeg',
      searchKeywords: ['curry', 'blend', 'aromatic', 'spices', 'masala', 'powder'],
      features: [
        { text: 'Signature Blend', icon: <Star className="w-3 h-3" />, color: 'bg-amber-100 text-amber-800' },
        { text: 'Aromatic Spices', icon: <Leaf className="w-3 h-3" />, color: 'bg-green-100 text-green-800' },
        { text: 'Fresh Ground', icon: <Award className="w-3 h-3" />, color: 'bg-purple-100 text-purple-800' },
        { text: 'Family Recipe', icon: <Star className="w-3 h-3" />, color: 'bg-red-100 text-red-800' }
      ]
    },
    {
      id: 3,
      name: 'Kobbari Karam',
      price: '300',
      weight: '500gm',
      rating: 5,
      reviewCount: 156,
      description: 'Traditional coconut-based spice mix with aromatic ingredients. A perfect accompaniment for rice, idli, and dosa with authentic South Indian flavors.',
      image: '/WhatsApp Image 2025-06-28 at 5.39.30 PM.jpeg',
      searchKeywords: ['kobbari', 'coconut', 'karam', 'south indian', 'rice', 'idli', 'dosa', 'traditional'],
      features: [
        { text: 'Coconut Base', icon: <Leaf className="w-3 h-3" />, color: 'bg-green-100 text-green-800' },
        { text: 'Traditional Mix', icon: <Star className="w-3 h-3" />, color: 'bg-amber-100 text-amber-800' },
        { text: 'Authentic Taste', icon: <Award className="w-3 h-3" />, color: 'bg-purple-100 text-purple-800' },
        { text: 'South Indian', icon: <Shield className="w-3 h-3" />, color: 'bg-orange-100 text-orange-800' }
      ]
    },
    {
      id: 4,
      name: 'Nalla Karam',
      price: '280',
      weight: '500gm',
      rating: 5,
      reviewCount: 203,
      description: 'A rich and tangy spice blend made with premium tamarind, garlic, and aromatic spices. Perfect for enhancing rice dishes and traditional meals with its distinctive sour-spicy flavor.',
      image: '/Nalla Karam.jpeg',
      searchKeywords: ['nalla', 'karam', 'tamarind', 'garlic', 'tangy', 'sour', 'spicy', 'rice'],
      features: [
        { text: 'Tamarind Rich', icon: <Star className="w-3 h-3" />, color: 'bg-amber-100 text-amber-800' },
        { text: 'Garlic Blend', icon: <Shield className="w-3 h-3" />, color: 'bg-red-100 text-red-800' },
        { text: 'Traditional Mix', icon: <Award className="w-3 h-3" />, color: 'bg-purple-100 text-purple-800' },
        { text: 'Aromatic Spices', icon: <Leaf className="w-3 h-3" />, color: 'bg-green-100 text-green-800' }
      ]
    },
    {
      id: 5,
      name: 'Turmeric Root Powder',
      price: '250',
      weight: '500gm',
      rating: 5,
      reviewCount: 94,
      description: 'Premium quality turmeric powder made from fresh turmeric roots. Known for its vibrant color, earthy flavor, and health benefits.',
      image: '/WhatsApp Image 2025-06-28 at 4.09.58 PM (1).jpeg',
      searchKeywords: ['turmeric', 'haldi', 'yellow', 'root', 'health', 'curcumin', 'powder'],
      features: [
        { text: 'Fresh Ground', icon: <Award className="w-3 h-3" />, color: 'bg-purple-100 text-purple-800' },
        { text: 'High Curcumin', icon: <Shield className="w-3 h-3" />, color: 'bg-blue-100 text-blue-800' },
        { text: 'Vibrant Color', icon: <Star className="w-3 h-3" />, color: 'bg-yellow-100 text-yellow-800' },
        { text: 'Health Benefits', icon: <Leaf className="w-3 h-3" />, color: 'bg-green-100 text-green-800' }
      ]
    }
  ];

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
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

  const handleWhatsAppOrder = (productName: string) => {
    const message = `Hi! I'd like to order ${productName}. Could you please provide me with more details about pricing and availability?`;
    const whatsappUrl = `https://wa.me/918179715455?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleQuantityChange = (productId: number, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: quantity
    }));
  };

  const handleAddToCartSuccess = (productName: string, quantity: number) => {
    setNotification({
      show: true,
      productName,
      quantity
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating 
            ? 'text-amber-400 fill-current drop-shadow-lg' 
            : 'text-white/40'
        }`}
      />
    ));
  };

  // Don't show this section if there's a search term (results are shown in Hero)
  if (searchTerm) {
    return null;
  }

  return (
    <>
      <section id="products" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Premium Products
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Discover our carefully curated selection of authentic spice blends, crafted with traditional methods and premium ingredients.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {products.map((product) => {
              const quantity = quantities[product.id] || 1;
              const totalPrice = (parseFloat(product.price) * quantity).toFixed(2);
              
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative"
                >
                  {/* Price Tag */}
                  <div className="absolute top-3 right-0 z-10">
                    <div className="relative">
                      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-2 shadow-lg">
                        <div className="text-center">
                          <div className="text-xs font-semibold opacity-90">₹{totalPrice}</div>
                          <div className="text-xs opacity-80">{product.weight}</div>
                        </div>
                        <div className="absolute left-0 top-0 w-0 h-0 border-t-[20px] border-b-[20px] border-r-[8px] border-t-transparent border-b-transparent border-r-orange-500 -translate-x-2"></div>
                      </div>
                    </div>
                  </div>

                  <div className="aspect-w-16 aspect-h-12 overflow-hidden relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    
                    {/* Star Rating overlay */}
                    <div className="absolute top-3 left-3">
                      <div className="flex items-center space-x-1 px-3 py-2 rounded-lg backdrop-blur-sm bg-black/20 border border-white/20">
                        <div className="flex space-x-0.5">
                          {renderStars(product.rating)}
                        </div>
                        <span className="text-xs font-bold text-white ml-1 drop-shadow-lg">
                          {product.rating}.0
                        </span>
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 pr-8">
                      {product.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                      {product.description}
                    </p>
                    
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm">Key Features:</h4>
                      <div className="flex flex-wrap gap-1">
                        {product.features.slice(0, 2).map((feature, index) => (
                          <div
                            key={index}
                            className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${feature.color} border border-opacity-20 hover:scale-105 transition-transform duration-200`}
                          >
                            {feature.icon}
                            <span>{feature.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quantity Selector and Add to Cart */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Quantity:</span>
                        <QuantitySelector
                          initialQuantity={quantity}
                          onChange={(qty) => handleQuantityChange(product.id, qty)}
                          size="sm"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <AddToCartButton
                          product={product}
                          quantity={quantity}
                          variant="primary"
                          size="md"
                          className="flex-1"
                          showIcon={true}
                          showText={false}
                          onAuthRequired={() => setIsAuthModalOpen(true)}
                          onSuccess={() => handleAddToCartSuccess(product.name, quantity)}
                        />
                        
                        <button
                          onClick={() => handleWhatsAppOrder(product.name)}
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 group"
                        >
                          <MessageCircle size={16} className="group-hover:animate-pulse" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cart Notification */}
      <CartNotification
        show={notification.show}
        productName={notification.productName}
        quantity={notification.quantity}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="login"
      />
    </>
  );
};

export default Products;