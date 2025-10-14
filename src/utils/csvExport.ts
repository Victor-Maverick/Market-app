// CSV Export Utility Functions

export interface CSVExportOptions {
  filename?: string;
  headers?: string[];
  data: any[];
  excludeFields?: string[];
}

export const exportToCSV = ({ 
  filename = 'export', 
  headers, 
  data, 
  excludeFields = [] 
}: CSVExportOptions) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]).filter(key => !excludeFields.includes(key));
  
  // Create CSV content
  const csvContent = [
    // Headers row
    csvHeaders.join(','),
    // Data rows
    ...data.map(row => 
      csvHeaders.map(header => {
        const value = row[header];
        // Handle values that might contain commas, quotes, or newlines
        if (value === null || value === undefined) {
          return '';
        }
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Specific export functions for different data types
export const exportUsersToCSV = (users: any[]) => {
  exportToCSV({
    filename: 'users_export',
    data: users,
    headers: ['id', 'firstName', 'lastName', 'email', 'phone', 'createdAt', 'status'],
    excludeFields: ['password', 'accessToken']
  });
};

export const exportOrdersToCSV = (orders: any[]) => {
  exportToCSV({
    filename: 'orders_export',
    data: orders,
    headers: ['orderNumber', 'buyerEmail', 'status', 'totalAmount', 'deliveryFee', 'grandTotal', 'createdAt'],
    excludeFields: ['items']
  });
};

export const exportTransactionsToCSV = (transactions: any[]) => {
  exportToCSV({
    filename: 'transactions_export',
    data: transactions,
    headers: ['id', 'orderNumber', 'amount', 'status', 'paymentMethod', 'createdAt'],
    excludeFields: ['internalId']
  });
};

export const exportVendorsToCSV = (vendors: any[]) => {
  exportToCSV({
    filename: 'vendors_export',
    data: vendors,
    headers: ['id', 'firstName', 'lastName', 'email', 'shopName', 'phone', 'status', 'createdAt'],
    excludeFields: ['password']
  });
};

export const exportDisputesToCSV = (disputes: any[]) => {
  exportToCSV({
    filename: 'disputes_export',
    data: disputes,
    headers: ['id', 'orderNumber', 'status', 'reason', 'requestTime', 'resolvedDate'],
    excludeFields: ['imageUrl']
  });
};