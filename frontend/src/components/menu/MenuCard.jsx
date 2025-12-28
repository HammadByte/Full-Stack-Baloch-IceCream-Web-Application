import React from 'react';
import { useCart } from '../../context/CartContext';
import { Plus, Minus } from 'lucide-react';

const MenuCard = ({ item }) => {
  const { addToCart, cartItems, updateQuantity } = useCart();
  
  const cartItem = cartItems.find(cartItem => cartItem._id === item._id);
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    addToCart(item);
  };

  const handleIncrease = () => {
    updateQuantity(item._id, quantity + 1);
  };

  const handleDecrease = () => {
    updateQuantity(item._id, quantity - 1);
  };

  const getCategoryColor = (category) => {
    const colors = {
      icecream: 'bg-blue-100 text-blue-800',
      roll: 'bg-orange-100 text-orange-800',
      shake: 'bg-purple-100 text-purple-800',
      dessert: 'bg-pink-100 text-pink-800',
      beverage: 'bg-green-100 text-green-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getSpicyLevel = (level) => {
    if (!level) return null;
    
    const levels = {
      mild: '🌶️',
      medium: '🌶️🌶️',
      spicy: '🌶️🌶️🌶️',
      'extra-spicy': '🌶️🌶️🌶️🌶️'
    };
    
    return <span className="text-sm">{levels[level]}</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Image Section */}
      <div className="h-48 bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center relative">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-2">🍦</div>
            <p className="text-sm">No image</p>
          </div>
        )}
        
        {/* Category Badge */}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
          {item.category}
        </div>
        
        {/* Spicy Level */}
        {item.spicyLevel && item.spicyLevel !== 'mild' && (
          <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-xs shadow-sm">
            {getSpicyLevel(item.spicyLevel)}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">{item.name}</h3>
          <p className="text-lg font-bold text-primary-600">Rs. {item.price}</p>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

        {/* Ingredients */}
        {item.ingredients && item.ingredients.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Ingredients:</p>
            <div className="flex flex-wrap gap-1">
              {item.ingredients.slice(0, 3).map((ingredient, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                >
                  {ingredient}
                </span>
              ))}
              {item.ingredients.length > 3 && (
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  +{item.ingredients.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Preparation Time */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>⏱️ {item.preparationTime} mins</span>
          <span>{item.isAvailable ? '✅ Available' : '❌ Unavailable'}</span>
        </div>

        {/* Add to Cart Button */}
        <div className="flex items-center justify-between">
          {quantity === 0 ? (
            <button
              onClick={handleAddToCart}
              disabled={!item.isAvailable}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                item.isAvailable
                  ? 'bg-primary-500 hover:bg-primary-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Add to Cart
            </button>
          ) : (
            <div className="flex items-center justify-between w-full bg-primary-50 rounded-lg p-1">
              <button
                onClick={handleDecrease}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary-100 transition-colors"
              >
                <Minus className="h-4 w-4 text-primary-600" />
              </button>
              <span className="font-semibold text-primary-700">{quantity}</span>
              <button
                onClick={handleIncrease}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary-100 transition-colors"
              >
                <Plus className="h-4 w-4 text-primary-600" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuCard;