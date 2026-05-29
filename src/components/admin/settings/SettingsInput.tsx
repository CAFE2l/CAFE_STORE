'use client';

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type SettingsInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export const SettingsInput = forwardRef<HTMLInputElement, SettingsInputProps>(
  ({ label, hint, id, className, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div>
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-zinc-300">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20',
            className,
          )}
          {...props}
        />
        {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
      </div>
    );
  }
);
SettingsInput.displayName = 'SettingsInput';

type SettingsTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  maxCount?: number;
};

export const SettingsTextarea = forwardRef<HTMLTextAreaElement, SettingsTextareaProps>(
  ({ label, hint, id, maxCount, className, value, ...props }, ref) => {
    const inputId = id ?? props.name;
    const charCount = typeof value === 'string' ? value.length : 0;
    return (
      <div>
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-zinc-300">
          {label}
        </label>
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20',
            className,
          )}
          value={value}
          {...props}
        />
        <div className="mt-1 flex items-center justify-between">
          {hint && <p className="text-xs text-zinc-500">{hint}</p>}
          {maxCount && (
            <p className={cn('ml-auto text-xs', charCount > maxCount ? 'text-red-400' : 'text-zinc-500')}>
              {charCount}/{maxCount}
            </p>
          )}
        </div>
      </div>
    );
  }
);
SettingsTextarea.displayName = 'SettingsTextarea';

type SettingsSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
  options: { value: string; label: string }[];
};

export const SettingsSelect = forwardRef<HTMLSelectElement, SettingsSelectProps>(
  ({ label, hint, id, options, className, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div>
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-zinc-300">
          {label}
        </label>
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20',
            className,
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0a0a0a]">
              {opt.label}
            </option>
          ))}
        </select>
        {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
      </div>
    );
  }
);
SettingsSelect.displayName = 'SettingsSelect';
