'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-2';

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[32px]',
      md: 'text-sm px-4 py-2.5 gap-2 min-h-[42px]',
      lg: 'text-base px-5 py-3 gap-2.5 min-h-[48px]',
    };

    const variantStyles = {
      primary:
        'bg-emerald-700 text-white hover:bg-emerald-800 focus:ring-emerald-600 shadow-sm hover:shadow shadow-emerald-900/10',
      success:
        'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm',
      secondary:
        'bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400 border border-slate-200/80',
      outline:
        'bg-transparent text-slate-700 hover:bg-slate-50 border border-slate-300 focus:ring-slate-400',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm hover:shadow shadow-rose-900/10',
      ghost:
        'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 focus:ring-slate-300',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>Chargement...</span>
          </>
        ) : (
          <>
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
