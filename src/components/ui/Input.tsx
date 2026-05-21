import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  icon?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, icon, id, label, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <label className="grid gap-2 text-sm text-text-secondary" htmlFor={inputId}>
        {label ? <span>{label}</span> : null}
        <span className="relative block">
          {icon ? (
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            className={cn('input-field w-full', icon ? 'pl-11' : undefined, className)}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error && inputId ? `${inputId}-error` : undefined}
            {...props}
          />
        </span>
        {error ? (
          <span id={inputId ? `${inputId}-error` : undefined} className="text-xs text-status-error">
            {error}
          </span>
        ) : null}
      </label>
    );
  },
);

Input.displayName = 'Input';
