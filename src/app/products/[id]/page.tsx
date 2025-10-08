'use client';

import React, { use } from 'react';

interface PageParams {
  id: string;
}

// Mock product data
const mockProduct = {
  id: 1,
  name: "Fresh Organic Tomatoes",
  price: 2500,
  description: "Premium quality organic tomatoes grown locally. Perfect for cooking and salads.",
  images: ["/images/tomatoes.jpg"],
  vendor: {
    email: "vendor@example.com",
    name: "Green Farm Store",
    shopId: 1
  },
  category: "Vegetables",
  inStock: true,
  rating: 4.5,
  reviews: 23
};

const ProductDetailsPage = ({ params }: { params: Promise<PageParams> }) => {
  use<PageParams>(params);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                <svg className="w-24 h-24 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{mockProduct.name}</h1>
                <p className="text-2xl font-semibold text-green-600 mt-2">
                  ₦{mockProduct.price.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(mockProduct.rating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {mockProduct.rating} ({mockProduct.reviews} reviews)
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{mockProduct.description}</p>
              </div>

              {/* Vendor Info */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Vendor Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{mockProduct.vendor.name}</p>
                      <p className="text-sm text-gray-600">{mockProduct.vendor.email}</p>
                    </div>
                    <div className="flex space-x-3">
                      {/* Chat Button */}
                      <button className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                        Chat
                      </button>

                      {/* Video Call Button */}
                      {/*<VideoCallButton*/}
                      {/*  vendorEmail={mockProduct.vendor.email}*/}
                      {/*  productId={mockProduct.id}*/}
                      {/*  shopId={mockProduct.vendor.shopId}*/}
                      {/*  productName={mockProduct.name}*/}
                      {/*  shopName={mockProduct.vendor.name}*/}
                      {/*  variant="primary"*/}
                      {/*/>*/}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                  Add to Cart
                </button>
                <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors">
                  Add to Wishlist
                </button>
              </div>

              {/* Stock Status */}
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  mockProduct.inStock ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <span className={`text-sm font-medium ${
                  mockProduct.inStock ? 'text-green-600' : 'text-red-600'
                }`}>
                  {mockProduct.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Product Information */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product Details</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><span className="font-medium">Category:</span> {mockProduct.category}</li>
                <li><span className="font-medium">Product ID:</span> {mockProduct.id}</li>
                <li><span className="font-medium">Availability:</span> {mockProduct.inStock ? 'In Stock' : 'Out of Stock'}</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Info</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Free delivery within Lagos</li>
                <li>Same day delivery available</li>
                <li>Express delivery: ₦500</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Return Policy</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>7-day return policy</li>
                <li>Fresh guarantee</li>
                <li>Full refund if not satisfied</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;