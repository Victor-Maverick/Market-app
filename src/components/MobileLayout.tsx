import React from 'react';

interface MobileLayoutProps {
  children: React.ReactNode;
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
  className?: string;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  showOnMobile = true,
  showOnDesktop = true,
  className = ''
}) => {
  let displayClasses = '';
  
  if (showOnMobile && showOnDesktop) {
    displayClasses = 'block';
  } else if (showOnMobile && !showOnDesktop) {
    displayClasses = 'block lg:hidden';
  } else if (!showOnMobile && showOnDesktop) {
    displayClasses = 'hidden lg:block';
  } else {
    displayClasses = 'hidden';
  }

  return (
    <div className={`${displayClasses} ${className}`}>
      {children}
    </div>
  );
};

export default MobileLayout;