import React from 'react';
import { Search, Sparkles } from 'lucide-react';

interface NoResultsProps {
  searchTerm: string;
  onClearSearch: () => void;
}

const NoResults: React.FC<NoResultsProps> = ({ searchTerm, onClearSearch }) => {
  const suggestions = [
    'Try searching for "chilli" or "curry"',
    'Check for spelling mistakes',
    'Use more general terms like "powder" or "spice"',
    'Browse all our products below'
  ];

  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="w-12 h-12 text-gray-400" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          No products found
        </h3>
        
        <p className="text-gray-600 mb-6">
          We couldn't find any products matching "{searchTerm}". Here are some suggestions:
        </p>
        
        <ul className="text-left space-y-2 mb-8">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-center text-gray-600">
              <Sparkles className="w-4 h-4 text-amber-500 mr-3 flex-shrink-0" />
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
        
        <button
          onClick={onClearSearch}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          View All Products
        </button>
      </div>
    </div>
  );
};

export default NoResults;