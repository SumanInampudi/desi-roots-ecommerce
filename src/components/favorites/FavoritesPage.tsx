import React, { useState, useMemo } from 'react';
import { Heart, Search, SortAsc, SortDesc, Filter, Trash2, ShoppingCart, MessageCircle, ArrowLeft } from 'lucide-react';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useNavigate } from 'react-router-dom';
import AddToCartButton from '../cart/AddToCartButton';
import AuthModal from '../auth/AuthModal';

type SortOption = 'name' | 'price' | 'date';
type SortDirection = 'asc' | 'desc';

const FavoritesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const { favorites, loading, error, removeFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  // Filter and sort favorites
  const filteredAndSortedFavorites = useMemo(() => {
    let filtered = favorites;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = favorites.filter(fav =>
        fav.product_name.toLowerCase().includes(searchLower) ||
        fav.product_weight?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.product_name.localeCompare(b.product_name);
          break;
        case 'price':
          const priceA = parseFloat(a.product_price);
          const priceB = parseFloat(b.product_price);
          comparison = priceA - priceB;
          break;
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [favorites, searchTerm, sortBy, sortDirection]);

  const handleRemoveFavorite = async (productId: number) => {
    try {
      await removeFavorite(productId);
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleAddToCart = async (favorite: any) => {
    try {
      const product = {
        id: favorite.product_id,
        name: favorite.product_name,
        price: favorite.product_price,
        weight: favorite.product_weight || '',
        rating: 5,
        reviewCount: 0,
        description: '',
        image: favorite.product_image || '',
        searchKeywords: [],
        features: []
      };

      await addToCart(product, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleWhatsAppOrder = (favorite: any) => {
    const message = `Hi! I'd like to order ${favorite.product_name} (${favorite.product_weight}). Could you please provide me with more details about pricing and availability?`;
    const whatsappUrl = `https://wa.me/918179715455?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const toggleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortDirection('asc');
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                <Heart className="w-8 h-8 text-red-600 fill-current" />
                <span>My Favorites</span>
              </h1>
              <p className="text-gray-600 mt-1">
                {favorites.length} {favorites.length === 1 ? 'product' : 'products'} in your favorites
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No favorites yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start adding products to your favorites by clicking the heart icon on any product you love!
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            {/* Search and Filter Controls */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search favorites..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                {/* Sort Controls */}
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Sort by:</span>
                  
                  <button
                    onClick={() => toggleSort('date')}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      sortBy === 'date' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>Date</span>
                    {sortBy === 'date' && (
                      sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => toggleSort('name')}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      sortBy === 'name' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>Name</span>
                    {sortBy === 'name' && (
                      sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => toggleSort('price')}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      sortBy === 'price' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>Price</span>
                    {sortBy === 'price' && (
                      sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Results count */}
              {searchTerm && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Showing {filteredAndSortedFavorites.length} of {favorites.length} favorites
                    {searchTerm && ` for "${searchTerm}"`}
                  </p>
                </div>
              )}
            </div>

            {/* Favorites Grid */}
            {filteredAndSortedFavorites.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites found</h3>
                <p className="text-gray-600">
                  No favorites match your search criteria. Try adjusting your search terms.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedFavorites.map((favorite) => (
                  <div
                    key={favorite.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {/* Product Image */}
                    <div className="aspect-w-16 aspect-h-12 overflow-hidden relative">
                      <img
                        src={favorite.product_image || '/placeholder-spice.jpg'}
                        alt={favorite.product_name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Remove from favorites button */}
                      <button
                        onClick={() => handleRemoveFavorite(favorite.product_id)}
                        className="absolute top-3 right-3 w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors duration-200 opacity-0 group-hover:opacity-100"
                        title="Remove from favorites"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Price tag */}
                      <div className="absolute top-3 left-3">
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-1 rounded-lg shadow-lg">
                          <div className="text-center">
                            <div className="text-sm font-semibold">₹{favorite.product_price}</div>
                            {favorite.product_weight && (
                              <div className="text-xs opacity-90">{favorite.product_weight}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {favorite.product_name}
                      </h3>
                      
                      {favorite.product_weight && (
                        <p className="text-sm text-gray-600 mb-3">
                          Weight: {favorite.product_weight}
                        </p>
                      )}

                      <p className="text-xs text-gray-500 mb-4">
                        Added on {new Date(favorite.created_at).toLocaleDateString()}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAddToCart(favorite)}
                          className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors duration-200"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </button>

                        <button
                          onClick={() => handleWhatsAppOrder(favorite)}
                          className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors duration-200"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Order</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="login"
      />
    </div>
  );
};

export default FavoritesPage;