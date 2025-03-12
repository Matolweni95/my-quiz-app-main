import React from 'react';

const Card = ({ className = '', children }) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export default Card;
