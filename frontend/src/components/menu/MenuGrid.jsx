import React from 'react';
import MenuCard from './MenuCard';
import LoadingSpinner from '../common/LoadingSpinner';

const MenuGrid = ({ items, loading, searchQuery }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🍦</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {searchQuery ? 'No items found' : 'No menu items available'}
        </h3>
        <p className="text-gray-600">
          {searchQuery 
            ? `No items found for "${searchQuery}". Try a different search.`
            : 'Check back later for our delicious offerings!'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <MenuCard key={item._id} item={item} />
      ))}
    </div>
  );
};

export default MenuGrid;