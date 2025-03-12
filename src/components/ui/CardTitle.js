import React from 'react';

const CardTitle = ({ className = '', children }) => {
  return (
    <h3 className={`text-2xl font-semibold text-gray-800 ${className}`}>
      {children}
    </h3>
  );
};

export default CardTitle;
