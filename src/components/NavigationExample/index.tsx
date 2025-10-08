'use client';
import React from 'react';
import { useSmartNavigation } from '@/utils/navigationUtils';

/**
 * Example component demonstrating how to use the navigation loading system
 * 
 * This component shows different ways to implement navigation with loading spinners:
 * 1. Smart navigation with automatic message detection
 * 2. Custom navigation messages
 * 3. Manual loader control
 */
const NavigationExample: React.FC = () => {
  const { smartNavigate, navigateWithLoader, showLoader, hideLoader } = useSmartNavigation();

  const handleSmartNavigation = () => {
    // Automatically detects the appropriate loading message based on the path
    smartNavigate('/vendor/dashboard');
  };

  const handleCustomNavigation = () => {
    // Uses a custom loading message
    navigateWithLoader('/admin/dashboard/main', 'Preparing admin panel...');
  };

  const handleManualLoader = async () => {
    // Manual control over the loader for complex operations
    showLoader('Processing your request...');
    
    try {
      // Simulate some async operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate after the operation
      smartNavigate('/marketPlace');
    } catch (error) {
      console.error('Operation failed:', error);
      hideLoader();
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold mb-4">Navigation Loading Examples</h2>
      
      <div className="space-y-3">
        <button
          onClick={handleSmartNavigation}
          className="block w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Smart Navigation (Auto Message)
        </button>
        
        <button
          onClick={handleCustomNavigation}
          className="block w-full p-3 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Custom Message Navigation
        </button>
        
        <button
          onClick={handleManualLoader}
          className="block w-full p-3 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          Manual Loader Control
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Usage Tips:</h3>
        <ul className="text-sm space-y-1">
          <li>• Use <code>smartNavigate(path)</code> for automatic message detection</li>
          <li>• Use <code>navigateWithLoader(path, message)</code> for custom messages</li>
          <li>• Use <code>showLoader()</code> and <code>hideLoader()</code> for manual control</li>
          <li>• The spinner automatically shows during page transitions</li>
        </ul>
      </div>
    </div>
  );
};

export default NavigationExample;