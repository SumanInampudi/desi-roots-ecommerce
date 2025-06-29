import React from 'react';
import { Award, Heart, Leaf, Users } from 'lucide-react';

const About: React.FC = () => {
  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Passion for Quality',
      description: 'Every spice blend is crafted with love and attention to detail, ensuring the highest quality in every package.'
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      title: 'Natural Ingredients',
      description: 'We source only the finest, natural ingredients without any artificial preservatives or additives.'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Traditional Methods',
      description: 'Our time-tested recipes and traditional grinding methods preserve the authentic flavors and aromas.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Family Legacy',
      description: 'Generations of spice expertise passed down through our family, bringing authentic taste to your kitchen.'
    }
  ];

  return (
    <section id="about" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            About Our Story
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            For generations, our family has been passionate about creating the perfect spice blends. 
            We combine traditional methods with modern hygiene standards to bring you the most authentic 
            and flavorful spices for your culinary adventures.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="text-center group hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-800 text-white rounded-full mb-6 group-hover:bg-green-900 group-hover:text-white transition-colors duration-300">
                {value.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {value.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-red-50 rounded-2xl p-8 lg:p-12">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Our Commitment to Excellence
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              We believe that great food starts with great ingredients. That's why we carefully select each spice, 
              ensuring it meets our strict quality standards. Our traditional grinding methods and family recipes 
              have been perfected over decades, creating spice blends that bring authentic flavors to modern kitchens. 
              When you choose our products, you're not just buying spices – you're bringing home a legacy of taste and tradition.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;