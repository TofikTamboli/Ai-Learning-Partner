import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'brutal-border bg-white px-4 py-3 text-brand-black placeholder:text-brand-gray',
          'focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2',
          'transition-all duration-150',
          error && 'ring-2 ring-red-500',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
