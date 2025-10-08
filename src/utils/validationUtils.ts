// Validation utilities for Nigerian identification numbers

export const formatNIN = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Limit to 11 digits
  const limited = digits.slice(0, 11);
  
  // Format as 0012 345 6789
  if (limited.length <= 4) {
    return limited;
  } else if (limited.length <= 7) {
    return `${limited.slice(0, 4)} ${limited.slice(4)}`;
  } else {
    return `${limited.slice(0, 4)} ${limited.slice(4, 7)} ${limited.slice(7)}`;
  }
};

export const formatTIN = (value: string): string => {
  // Remove all non-digits and hyphens
  const cleaned = value.replace(/[^\d-]/g, '');
  
  // Remove existing hyphens to reformat
  const digits = cleaned.replace(/-/g, '');
  
  // Limit to 10 digits
  const limited = digits.slice(0, 10);
  
  // Format as 12345678-0001
  if (limited.length <= 8) {
    return limited;
  } else {
    return `${limited.slice(0, 8)}-${limited.slice(8)}`;
  }
};

export const formatCAC = (value: string): string => {
  // Keep letters, digits, and hyphens
  const cleaned = value.replace(/[^A-Za-z0-9-]/g, '').toUpperCase();
  
  // Check if it starts with RC- or BN-
  if (cleaned.startsWith('RC-')) {
    const digits = cleaned.slice(3).replace(/\D/g, '');
    return `RC-${digits.slice(0, 5)}`;
  } else if (cleaned.startsWith('BN-')) {
    const digits = cleaned.slice(3).replace(/\D/g, '');
    return `BN-${digits.slice(0, 7)}`;
  } else {
    // Auto-detect format based on length
    const digits = cleaned.replace(/[^0-9]/g, '');
    if (digits.length <= 5) {
      return `RC-${digits}`;
    } else {
      return `BN-${digits.slice(0, 7)}`;
    }
  }
};

export const validateNIN = (nin: string): boolean => {
  const ninRegex = /^\d{4}\s\d{3}\s\d{4}$/;
  return ninRegex.test(nin);
};

export const validateTIN = (tin: string): boolean => {
  const tinRegex = /^\d{8}-\d{4}$/;
  return tinRegex.test(tin);
};

export const validateCAC = (cac: string): boolean => {
  const rcRegex = /^RC-\d{5}$/;
  const bnRegex = /^BN-\d{7}$/;
  return rcRegex.test(cac) || bnRegex.test(cac);
};