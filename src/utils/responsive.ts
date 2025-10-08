// Responsive utility functions and constants

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

export const spacing = {
  mobile: {
    xs: 'px-2',
    sm: 'px-4',
    md: 'px-6',
    lg: 'px-8'
  },
  tablet: {
    xs: 'sm:px-4',
    sm: 'sm:px-6',
    md: 'sm:px-8',
    lg: 'sm:px-12'
  },
  desktop: {
    xs: 'lg:px-6',
    sm: 'lg:px-8',
    md: 'lg:px-12',
    lg: 'lg:px-16'
  }
} as const;

export const typography = {
  mobile: {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  },
  tablet: {
    xs: 'sm:text-sm',
    sm: 'sm:text-base',
    base: 'sm:text-lg',
    lg: 'sm:text-xl',
    xl: 'sm:text-2xl',
    '2xl': 'sm:text-3xl'
  },
  desktop: {
    xs: 'lg:text-base',
    sm: 'lg:text-lg',
    base: 'lg:text-xl',
    lg: 'lg:text-2xl',
    xl: 'lg:text-3xl',
    '2xl': 'lg:text-4xl'
  }
} as const;

export const grid = {
  cols: {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  },
  responsive: {
    mobile: {
      1: 'grid-cols-1',
      2: 'grid-cols-2'
    },
    tablet: {
      1: 'sm:grid-cols-1',
      2: 'sm:grid-cols-2',
      3: 'sm:grid-cols-3',
      4: 'sm:grid-cols-4'
    },
    desktop: {
      1: 'lg:grid-cols-1',
      2: 'lg:grid-cols-2',
      3: 'lg:grid-cols-3',
      4: 'lg:grid-cols-4',
      5: 'lg:grid-cols-5',
      6: 'lg:grid-cols-6'
    }
  }
} as const;

export const flexbox = {
  direction: {
    mobile: {
      col: 'flex-col',
      row: 'flex-row'
    },
    tablet: {
      col: 'sm:flex-col',
      row: 'sm:flex-row'
    },
    desktop: {
      col: 'lg:flex-col',
      row: 'lg:flex-row'
    }
  },
  justify: {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around'
  },
  align: {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  }
} as const;

// Utility function to combine responsive classes
export const combineResponsiveClasses = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

// Common responsive patterns
export const responsivePatterns = {
  // Container with responsive padding
  container: combineResponsiveClasses(
    'w-full mx-auto',
    spacing.mobile.sm,
    spacing.tablet.md,
    spacing.desktop.lg
  ),
  
  // Card grid responsive
  cardGrid: combineResponsiveClasses(
    'grid gap-4',
    grid.responsive.mobile[2],
    grid.responsive.tablet[3],
    grid.responsive.desktop[4]
  ),
  
  // Product grid responsive
  productGrid: combineResponsiveClasses(
    'grid gap-2 sm:gap-4',
    grid.responsive.mobile[2],
    grid.responsive.tablet[3],
    grid.responsive.desktop[5]
  ),
  
  // Dashboard metrics responsive
  metricsGrid: combineResponsiveClasses(
    'flex flex-col lg:flex-row gap-4',
    'w-full'
  ),
  
  // Text responsive
  heading: combineResponsiveClasses(
    typography.mobile.lg,
    typography.tablet.xl,
    typography.desktop.xl
  ),
  
  subheading: combineResponsiveClasses(
    typography.mobile.base,
    typography.tablet.lg,
    typography.desktop.lg
  ),
  
  body: combineResponsiveClasses(
    typography.mobile.sm,
    typography.tablet.base,
    typography.desktop.base
  )
};

// Hook for responsive behavior
export const useResponsive = () => {
  if (typeof window === 'undefined') return { isMobile: false, isTablet: false, isDesktop: true };
  
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
  const isDesktop = window.innerWidth >= 1024;
  
  return { isMobile, isTablet, isDesktop };
};