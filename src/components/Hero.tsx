import React from 'react';
import { Truck, Leaf, Award, Clock, MessageCircle, Star, Shield, X, Gift } from 'lucide-react';
import SearchBar from './SearchBar';
import NoResults from './NoResults';

interface HeroProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  resultsCount: number;
  totalCount: number;
  filteredProducts: any[];
}

const Hero: React.FC<HeroProps> = ({ 
  searchTerm, 
  onSearchChange, 
  resultsCount, 
  totalCount, 
  filteredProducts 
}) => {
  const [showAnnouncement, setShowAnnouncement] = React.useState(true);

  const features = [
    {
      icon: <Truck className="w-6 h-6" />,
      title: 'Free Delivery',
      subtitle: 'On orders above ₹500',
      color: 'bg-blue-500'
    },
    {
      icon: <Leaf className="w-6 h-6" />,
      title: '100% Natural',
      subtitle: 'No artificial additives',
      color: 'bg-green-500'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Premium Quality',
      subtitle: 'Traditional recipes',
      color: 'bg-purple-500'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Fresh Ground',
      subtitle: 'Made to order',
      color: 'bg-orange-500'
    }
  ];

  const handleWhatsAppOrder = (productName: string) => {
    const message = `Hi! I'd like to order ${productName}. Could you please provide me with more details about pricing and availability?`;
    const whatsappUrl = `https://wa.me/918179715455?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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

  return (
    <section id="home" className="relative pt-16 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/WhatsApp Image 2025-06-28 at 4.09.58 PM copy.jpeg"
          alt="Spice background"
          className="w-full h-full object-cover"
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Decorative background curves */}
      <div className="absolute inset-0 z-10">
        <svg
          className="absolute top-0 left-0 w-full h-64 text-red-800/20"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
        >
          <path
            d="M0,100 C300,200 900,0 1200,100 L1200,0 L0,0 Z"
            fill="currentColor"
          />
        </svg>
        <svg
          className="absolute bottom-0 left-0 w-full h-64 text-red-800/20"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
        >
          <path
            d="M0,300 C300,200 900,400 1200,300 L1200,400 L0,400 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Ultra Thin Scrolling Announcement Bar */}
        {showAnnouncement && (
          <div className="pt-2 pb-1">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg shadow-lg overflow-hidden relative h-8">
              {/* Scrolling text container */}
              <div className="flex items-center h-full relative overflow-hidden">
                {/* Scrolling text */}
                <div className="flex items-center animate-scroll whitespace-nowrap">
                  <div className="flex items-center space-x-2 px-4">
                    <Truck className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs font-semibold">
                      🚚 FREE Delivery on all orders above ₹500 - Limited time offer!
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 px-4">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs font-semibold">
                      ⚡ Fresh Stock Alert: All spices ground fresh daily - Order now for maximum flavor!
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 px-4">
                    <Award className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs font-semibold">
                      🏆 Premium Quality Guarantee: 100% authentic Guntur spices with traditional recipes!
                    </span>
                  </div>
                  {/* Duplicate for seamless loop */}
                  <div className="flex items-center space-x-2 px-4">
                    <Truck className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs font-semibold">
                      🚚 FREE Delivery on all orders above ₹500 - Limited time offer!
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 px-4">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs font-semibold">
                      ⚡ Fresh Stock Alert: All spices ground fresh daily - Order now for maximum flavor!
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 px-4">
                    <Award className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs font-semibold">
                      🏆 Premium Quality Guarantee: 100% authentic Guntur spices with traditional recipes!
                    </span>
                  </div>
                </div>
                
                {/* Close button */}
                <button
                  onClick={() => setShowAnnouncement(false)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors duration-200 group z-10 bg-black/20"
                  aria-label="Close announcement"
                >
                  <X className="w-3 h-3 group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>

              {/* Gradient fade edges */}
              <div className="absolute left-0 top-0 w-8 h-full bg-gradient-to-r from-red-600 to-transparent pointer-events-none"></div>
              <div className="absolute right-0 top-0 w-12 h-full bg-gradient-to-l from-orange-600 to-transparent pointer-events-none"></div>
            </div>
          </div>
        )}

        {/* Search Bar positioned right below announcement bar */}
        <div className="pt-4 pb-6">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            resultsCount={resultsCount}
            totalCount={totalCount}
          />
        </div>

        {/* Search Results Section */}
        {searchTerm && (
          <div className="mb-8">
            {filteredProducts.length === 0 ? (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20">
                <NoResults 
                  searchTerm={searchTerm} 
                  onClearSearch={() => onSearchChange('')}
                />
              </div>
            ) : (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Search Results
                  </h3>
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-green-800 font-semibold text-sm">
                      {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                    </span>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative border border-gray-100"
                    >
                      {/* Elegant Price Tag */}
                      <div className="absolute top-3 right-3 z-10">
                        <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white px-3 py-2 rounded-lg shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform duration-300">
                          <div className="text-center">
                            <div className="text-xs font-semibold opacity-90">₹{product.price}</div>
                            <div className="text-xs opacity-80">{product.weight}</div>
                          </div>
                        </div>
                      </div>

                      <div className="aspect-w-16 aspect-h-12 overflow-hidden relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Star Rating overlay at top of image */}
                        <div className="absolute top-3 left-3">
                          <div className="flex items-center space-x-1 px-3 py-2 rounded-lg backdrop-blur-sm bg-black/20 border border-white/20">
                            <div className="flex space-x-0.5">
                              {renderStars(product.rating || 5)}
                            </div>
                            <span className="text-xs font-bold text-white ml-1 drop-shadow-lg">
                              {product.rating || 5}.0
                            </span>
                          </div>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      
                      <div className="p-4">
                        <h4 className="text-lg font-bold text-gray-900 mb-2 pr-8 group-hover:text-red-700 transition-colors duration-300">
                          {product.name}
                        </h4>
                        
                        <p className="text-gray-600 mb-3 text-sm leading-relaxed line-clamp-2">
                          {product.description}
                        </p>
                        
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {product.features.slice(0, 2).map((feature, index) => (
                              <div
                                key={index}
                                className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 hover:scale-105 transition-transform duration-200"
                              >
                                <Leaf className="w-3 h-3" />
                                <span>{feature.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => handleWhatsAppOrder(product.name)}
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <MessageCircle size={16} className="animate-pulse" />
                          <span>Order Now</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-center mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex items-center text-red-600 hover:text-red-700 font-semibold text-sm hover:underline transition-all duration-200 group"
                  >
                    <span>View all products below</span>
                    <svg className="w-4 h-4 ml-1 group-hover:translate-y-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hero Content - only show when not searching */}
        {!searchTerm && (
          <div className="text-center py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 drop-shadow-2xl">
              The Authentic Taste of
              <span className="text-amber-400 block drop-shadow-lg bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent font-extrabold">Guntur Spice</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/95 mb-8 max-w-3xl mx-auto drop-shadow-lg font-serif italic leading-relaxed tracking-wide">
              Experience the rich flavors of traditional spices, carefully crafted for the modern kitchen
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-4xl mx-auto">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group border border-white/20"
                >
                  <div className={`${feature.color} w-12 h-12 rounded-full flex items-center justify-center text-white mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {feature.subtitle}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg border-2 border-orange-400/50 hover:shadow-xl"
              >
                View Our Products
              </button>
              <a
                href="https://wa.me/918179715455?text=Hi, I'm interested in your spice products!"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2 hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                <span>Order on WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;