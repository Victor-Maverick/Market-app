// Utility functions for consistent status styling across admin routes

export const getStatusStyling = (status: string): string => {
  const normalizedStatus = status?.toLowerCase() || '';
  
  // Success statuses - Green
  if (
    normalizedStatus === '0' ||
    normalizedStatus.includes('success') ||
    normalizedStatus.includes('successful') ||
    normalizedStatus === 'completed' ||
    normalizedStatus === 'approved' ||
    normalizedStatus === 'paid' ||
    normalizedStatus === 'delivered'
  ) {
    return 'bg-[#ECFDF3] text-[#027A48] border-[#027A48]';
  }
  
  // Pending/Warning statuses - Orange/Yellow
  if (
    normalizedStatus === 'pending' ||
    normalizedStatus === 'processing' ||
    normalizedStatus === 'in_progress' ||
    normalizedStatus === 'awaiting' ||
    normalizedStatus === 'review'
  ) {
    return 'bg-[#fffaeb] text-[#DD6A02] border-[#DD6A02]';
  }
  
  // Info statuses - Blue
  if (
    normalizedStatus === 'processed' ||
    normalizedStatus === 'shipped' ||
    normalizedStatus === 'in_transit'
  ) {
    return 'bg-[#E1F5FE] text-[#0277BD] border-[#0277BD]';
  }
  
  // Error/Failed statuses - Red
  if (
    normalizedStatus === 'failed' ||
    normalizedStatus === 'rejected' ||
    normalizedStatus === 'cancelled' ||
    normalizedStatus === 'declined' ||
    normalizedStatus === 'error'
  ) {
    return 'bg-[#FEF3F2] text-[#FF5050] border-[#FF5050]';
  }
  
  // Default - Orange for unknown statuses
  return 'bg-[#fffaeb] text-[#DD6A02] border-[#DD6A02]';
};

export const getStatusText = (status: string): string => {
  if (status === '0') return 'successful';
  return status?.toLowerCase() || 'unknown';
};

export const isSuccessStatus = (status: string): boolean => {
  const normalizedStatus = status?.toLowerCase() || '';
  return (
    normalizedStatus === '0' ||
    normalizedStatus.includes('success') ||
    normalizedStatus.includes('successful') ||
    normalizedStatus === 'completed' ||
    normalizedStatus === 'approved' ||
    normalizedStatus === 'paid' ||
    normalizedStatus === 'delivered'
  );
};

export const isPendingStatus = (status: string): boolean => {
  const normalizedStatus = status?.toLowerCase() || '';
  return (
    normalizedStatus === 'pending' ||
    normalizedStatus === 'processing' ||
    normalizedStatus === 'in_progress' ||
    normalizedStatus === 'awaiting' ||
    normalizedStatus === 'review'
  );
};

export const isFailedStatus = (status: string): boolean => {
  const normalizedStatus = status?.toLowerCase() || '';
  return (
    normalizedStatus === 'failed' ||
    normalizedStatus === 'rejected' ||
    normalizedStatus === 'cancelled' ||
    normalizedStatus === 'declined' ||
    normalizedStatus === 'error'
  );
};