'use client';

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface PhoneInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  hint?: string;
}

export function PhoneInputField({ value, onChange, label, hint }: PhoneInputFieldProps) {
  return (
    <div>
      {label && <label className="mb-1.5 block text-sm font-medium text-zinc-300">{label}</label>}
      <PhoneInput
        country="br"
        value={value}
        onChange={(phone) => onChange(phone)}
        placeholder="(41) 99671-3782"
        inputClass="!h-10 !w-full !rounded-lg !border !border-white/10 !bg-white/[0.04] !px-3 !pl-[52px] !text-sm !text-white !outline-none !transition placeholder:!text-zinc-600 focus:!border-orange-500/50 focus:!ring-1 focus:!ring-orange-500/20"
        buttonClass="!h-10 !w-11 !rounded-l-lg !border !border-white/10 !bg-white/[0.06] !border-r-0 !px-1"
        dropdownClass="!bg-[#1a1a1a] !border !border-white/10 !rounded-xl"
        searchClass="!bg-white/[0.06] !border !border-white/10 !rounded-lg !text-white"
        enableSearch
        searchPlaceholder="Buscar país..."
      />
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}
