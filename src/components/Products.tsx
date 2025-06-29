import React from 'react';
import { MessageCircle } from 'lucide-react';

const Products: React.FC = () => {
  const products = [
    {
      id: 1,
      name: 'Plain Chilli Powder',
      description: 'Pure, aromatic chilli powder made from the finest red chillies. Perfect for adding heat and flavor to any dish.',
      image: '/WhatsApp Image 2025-06-28 at 4.10.33 PM.jpeg',
      features: ['100% Natural', 'No Preservatives', 'Premium Quality', 'Traditional Recipe']
    },
    {
      id: 2,
      name: 'Curry Powder',
      description: 'A perfect blend of aromatic spices that brings authentic curry flavors to your kitchen. Versatile and full of taste.',
      image: '/WhatsApp Image 2025-06-28 at 4.10.33 PM copy.jpeg',
      features: ['Signature Blend', 'Aromatic Spices', 'Fresh Ground', 'Family Recipe']
    }
  ];

  const handleWhatsAppOrder = (productName: string) => {
    const message = `Hi! I'd like to order ${productName}. Could you please provide me with more details about pricing and availability?`;
    const whatsappUrl = `https://wa.me/918179715455?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section id="products" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Premium Products
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our carefully curated selection of authentic spice blends, crafted with traditional methods and premium ingredients.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="aspect-w-16 aspect-h-12 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {product.description}
                </p>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {product.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-red-800 rounded-full mr-3"></div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleWhatsAppOrder(product.name)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 group"
                >
                  <MessageCircle size={20} className="group-hover:animate-pulse" />
                  <span>Order on WhatsApp</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;