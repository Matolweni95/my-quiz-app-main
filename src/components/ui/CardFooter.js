import React from 'react';

const CardFooter = ({ className = '', children }) => {
  return (
    <div className={`p-4 text-center text-[--default] ${className}`}>
      {children}
    </div>
  );
};

export default CardFooter;
