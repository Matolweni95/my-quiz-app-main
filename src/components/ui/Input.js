import React from 'react';

const Input = ({ className = '', ...props }) => {
  return (
    <input
      className={`px-4 w-full text-[--default] py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 ${className}`}
      {...props}
    />
  );
};

export default Input;
