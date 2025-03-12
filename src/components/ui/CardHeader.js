import React from 'react';

const CardHeader = ({ className = '', children }) => {
  return (
    <div className={`p-4 -b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

export default CardHeader;
