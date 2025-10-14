import React from 'react';
import { exportToCSV, CSVExportOptions } from '@/utils/csvExport';

interface CSVExportButtonProps {
  data: any[];
  filename?: string;
  headers?: string[];
  excludeFields?: string[];
  className?: string;
  disabled?: boolean;
}

const CSVExportButton: React.FC<CSVExportButtonProps> = ({
  data,
  filename = 'export',
  headers,
  excludeFields = [],
  className = '',
  disabled = false
}) => {
  const handleExport = () => {
    if (disabled || !data || data.length === 0) {
      alert('No data available to export');
      return;
    }

    const exportOptions: CSVExportOptions = {
      filename,
      data,
      headers,
      excludeFields
    };

    exportToCSV(exportOptions);
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || !data || data.length === 0}
      className={`
        flex items-center gap-2 px-3 py-2 text-sm font-medium 
        bg-green-600 text-white rounded-md hover:bg-green-700 
        disabled:bg-gray-400 disabled:cursor-not-allowed
        transition-colors duration-200
        ${className}
      `}
      title="Export to CSV"
    >
      <svg 
        className="w-4 h-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
        />
      </svg>
      Export CSV
    </button>
  );
};

export default CSVExportButton;