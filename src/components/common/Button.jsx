import React from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className,
  isLoading = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  disabled,
  ...props
}, ref) => {
  
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-blue-700 focus:ring-primary",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary",
    danger: "bg-danger text-white hover:bg-red-700 focus:ring-danger",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {isLoading ? (
        <Loader2 className={clsx("animate-spin", size === 'sm' ? "h-4 w-4 mr-2" : "h-5 w-5 mr-2")} />
      ) : LeftIcon ? (
        <LeftIcon className={clsx(size === 'sm' ? "h-4 w-4 mr-2" : "h-5 w-5 mr-2")} />
      ) : null}
      
      {children}
      
      {!isLoading && RightIcon && (
        <RightIcon className={clsx(size === 'sm' ? "h-4 w-4 ml-2" : "h-5 w-5 ml-2")} />
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
