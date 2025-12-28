import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Printer, ArrowLeft, Home } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <Link
            to="/"
            className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-primary-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-green-500 p-4 rounded-full">
                <CheckCircle className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Order Confirmed!
            </h1>
            <p className="text-xl text-gray-600">
              Thank you for your order at Baloch Ice Cream
            </p>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden print:shadow-none">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Order #{order.orderNumber}</h2>
                  <p className="text-primary-100">
                    {new Date(order.createdAt).toLocaleDateString()} at{' '}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <p className="text-3xl font-bold">Rs. {order.totalAmount.toFixed(2)}</p>
                  <p className="text-primary-100 capitalize">{order.orderType} • {order.paymentMethod}</p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{order.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{order.customer.phone}</p>
                </div>
                {order.customer.address && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Delivery Address</p>
                    <p className="font-medium text-gray-900">{order.customer.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg flex items-center justify-center">
                        {item.menuItem?.image ? (
                          <img
                            src={item.menuItem.image}
                            alt={item.menuItem.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-lg">🍦</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.menuItem?.name}</p>
                        <p className="text-sm text-gray-600">
                          Rs. {item.price} × {item.quantity}
                        </p>
                        {item.specialInstructions && (
                          <p className="text-xs text-gray-500">
                            Note: {item.specialInstructions}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">
                      Rs. {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Total */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">Rs. {order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">Rs. 0.00</span>
              </div>
              <div className="flex justify-between items-center border-t pt-3">
                <span className="text-xl font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-primary-600">
                  Rs. {order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Special Instructions */}
            {order.specialInstructions && (
              <div className="p-6 border-t border-gray-200 bg-yellow-50">
                <h4 className="font-semibold text-yellow-800 mb-2">Special Instructions</h4>
                <p className="text-yellow-700">{order.specialInstructions}</p>
              </div>
            )}

            {/* Status */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Status</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">{order.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Estimated Time</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {order.preparationTime} minutes
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Printer className="h-5 w-5" />
              <span>Print Receipt</span>
            </button>
            
            <button
              onClick={() => navigate('/orders')}
              className="flex items-center justify-center space-x-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>View All Orders</span>
            </button>
            
            <Link
              to="/"
              className="flex items-center justify-center space-x-2 bg-secondary-500 text-white px-6 py-3 rounded-lg hover:bg-secondary-600 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>Back to Menu</span>
            </Link>
          </div>

          {/* Next Steps */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              We'll notify you when your order is ready. 
              {order.orderType === 'delivery' && ' Your food will be delivered to your address.'}
              {order.orderType === 'takeaway' && ' Please come to the counter to collect your order.'}
              {order.orderType === 'dine-in' && ' Your order will be served at your table.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;