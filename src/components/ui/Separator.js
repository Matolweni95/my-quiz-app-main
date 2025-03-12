import React from 'react';

const Separator = ({ className = '' }) => {
  return <hr className={`my-4 border-t border-gray-300 ${className}`} />;
};

export default Separator;
