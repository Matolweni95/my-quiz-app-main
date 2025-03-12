import React from 'react';

const CardDescription = ({ className = '', children }) => {
  return (
    <p className={`text-sm text-gray-600 ${className}`}>
      {children}
    </p>
  );
};

export default CardDescription;
