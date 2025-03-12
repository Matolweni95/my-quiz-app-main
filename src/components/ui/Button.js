import React from 'react';

const Button = ({ type = 'button', variant = 'primary', className = '', ...props }) => {
  const baseStyles = 'px-4 py-2 rounded focus:outline-none';
  const variantStyles = {
    primary: 'bg-primary-500 text-white hover:bg-primary-700',
    ghost: 'bg-transparent  border border-primary hover:bg-primary-100',
    outline: 'border border-primary-500 text-primary-500 hover:bg-primary-100',
  };
  
  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {props.children}
    </button>
  );
};

export default Button;
