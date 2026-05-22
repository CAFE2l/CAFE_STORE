import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Check, AlertCircle } from 'lucide-react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  success?: boolean;
  icon?: ReactNode;
  rightButton?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, success, icon, rightButton, id, label, ...props }, ref) => {
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
            className={cn(
              'input-field w-full',
              icon ? 'pl-11' : undefined,
              error ? 'border-status-error ring-status-error/20' : undefined,
              success ? 'border-status-success ring-status-success/20' : undefined,
              rightButton ? 'pr-12' : undefined,
              className,
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error && inputId ? `${inputId}-error` : undefined}
            {...props}
          />
          {success ? (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-status-success">
              <Check className="h-4 w-4" />
            </span>
          ) : null}
          {rightButton ? (
            <span className="absolute right-2 top-1/2 -translate-y-1/2">{rightButton}</span>
          ) : null}
        </span>
        {error ? (
          <span id={inputId ? `${inputId}-error` : undefined} className="flex items-center gap-1 text-xs text-status-error">
            <AlertCircle className="h-3 w-3" />
            {error}
          </span>
        ) : null}
      </label>
    );
  },
);

Input.displayName = 'Input';
