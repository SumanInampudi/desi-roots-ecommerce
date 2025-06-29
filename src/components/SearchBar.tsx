import React from 'react';
import { Search, X, Sparkles } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  resultsCount: number;
  totalCount: number;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchTerm, 
  onSearchChange, 
  resultsCount, 
  totalCount 
}) => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="relative group">
        {/* Glowing border effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-400 group-hover:text-amber-500 transition-colors duration-300" />
          </div>
          
          <input
            type="text"
            placeholder="Search for spices, blends, or ingredients..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-14 pr-14 py-5 text-lg border-2 border-white/40 rounded-2xl focus:border-amber-400 focus:ring-4 focus:ring-amber-100/50 transition-all duration-300 bg-white/95 backdrop-blur-sm shadow-2xl placeholder-gray-500 hover:shadow-3xl focus:shadow-3xl hover:bg-white focus:bg-white"
          />
          
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-red-500 transition-colors duration-200 group"
            >
              <div className="p-1 rounded-full hover:bg-red-50 transition-colors duration-200">
                <X className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              </div>
            </button>
          )}
        </div>
      </div>
      
      {searchTerm && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-black/40 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-300 mr-2 animate-pulse" />
            <p className="text-white/95 text-sm font-medium">
              {resultsCount === 0 ? (
                <span className="text-red-300 font-semibold">No products found</span>
              ) : (
                <>
                  Found <span className="font-bold text-amber-300">{resultsCount}</span> of{' '}
                  <span className="font-semibold">{totalCount}</span> products
                </>
              )}
              {searchTerm && (
                <span className="ml-2">
                  for "<span className="font-bold text-white">{searchTerm}</span>"
                </span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;