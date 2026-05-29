'use client';

type SettingsToggleProps = {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

export function SettingsToggle({ label, description, value, onChange }: SettingsToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-300">{label}</p>
        {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-all duration-300 ${
          value ? 'bg-orange-500' : 'bg-white/[0.10]'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-all duration-300 shadow ${
            value ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
