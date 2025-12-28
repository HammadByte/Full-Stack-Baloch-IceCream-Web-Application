import React, { useState, useEffect } from 'react';
import MenuGrid from '../components/menu/MenuGrid';
import { menuService } from '../services/menuService';
import { Search, Filter, X } from 'lucide-react';

const Home = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'icecream', label: 'Ice Cream' },
    { value: 'roll', label: 'Rolls' },
    { value: 'shake', label: 'Shakes' },
    { value: 'dessert', label: 'Desserts' },
    { value: 'beverage', label: 'Beverages' },
  ];

  useEffect(() => {
    fetchMenuItems();
  }, [selectedCategory, showAvailableOnly]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (selectedCategory) params.category = selectedCategory;
      if (showAvailableOnly) params.available = true;
      if (searchQuery) params.search = searchQuery;

      const response = await menuService.getMenuItems(params);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMenuItems();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setShowAvailableOnly(false);
  };

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-primary-600">Baloch Ice Cream</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our delicious range of ice creams, rolls, shakes, and more. 
            Made with love and the finest ingredients.
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 w-full lg:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            {/* Available Only Toggle */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAvailableOnly}
                onChange={(e) => setShowAvailableOnly(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-gray-700">Available Only</span>
            </label>

            {/* Clear Filters */}
            {(searchQuery || selectedCategory || showAvailableOnly) && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Menu Grid */}
        <MenuGrid 
          items={filteredItems} 
          loading={loading} 
          searchQuery={searchQuery}
        />

        {/* Stats */}
        {!loading && (
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              Showing {filteredItems.length} of {menuItems.length} items
              {selectedCategory && ` in ${categories.find(c => c.value === selectedCategory)?.label}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;