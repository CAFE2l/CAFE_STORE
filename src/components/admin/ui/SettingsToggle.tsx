'use client';

type SettingsToggleProps = {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

export function SettingsToggle({ label, description, value, onChange }: SettingsToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3.5 text-left transition-all duration-200 ${
        value
          ? 'border-orange-500/20 bg-orange-500/[0.06]'
          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.10] hover:bg-white/[0.05]'
      }`}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-zinc-300">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-zinc-500">{description}</span>}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-all duration-300 ${
          value ? 'bg-orange-500' : 'bg-white/[0.10]'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-all duration-300 shadow ${
            value ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  );
}
