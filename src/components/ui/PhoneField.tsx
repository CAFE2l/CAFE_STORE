'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ChevronDown, Search } from 'lucide-react';
import {
  Controller,
  type Control,
  type ControllerRenderProps,
  type FieldError,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import PhoneInput, {
  formatPhoneNumberIntl,
  getCountryCallingCode,
  parsePhoneNumber,
  type Country,
  type Value,
} from 'react-phone-number-input';
import labels from 'react-phone-number-input/locale/pt-BR.json';
import flags from 'react-phone-number-input/flags';

type PhoneFieldProps<TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>;
  label: string;
  control: Control<TFieldValues>;
  error?: FieldError;
  defaultCountry?: Country;
  onChange?: (value: string) => void;
};

type CountryOption = {
  value?: Country;
  label: string;
  divider?: boolean;
};

type CountrySelectProps = {
  value?: Country;
  options: CountryOption[];
  onChange: (country?: Country) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  readOnly?: boolean;
  iconComponent: React.ElementType;
};

const priorityCountries: Country[] = ['BR', 'US', 'PT', 'GB'];

export function PhoneField<TFieldValues extends FieldValues>({
  name,
  label,
  control,
  error,
  defaultCountry = 'BR',
  onChange,
}: PhoneFieldProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <ControlledPhoneInput<TFieldValues>
          field={field}
          label={label}
          error={error}
          defaultCountry={defaultCountry}
          onExternalChange={onChange}
        />
      )}
    />
  );
}

function ControlledPhoneInput<TFieldValues extends FieldValues>({
  field,
  label,
  error,
  defaultCountry,
  onExternalChange,
}: {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  label: string;
  error?: FieldError;
  defaultCountry: Country;
  onExternalChange?: (value: string) => void;
}) {
  const [country, setCountry] = useState<Country | undefined>(defaultCountry);
  const errorMessage = getPhoneErrorMessage(error?.message, field.value, country);

  useEffect(() => {
    if (typeof field.value !== 'string' || field.value.length === 0) return;

    const normalized = normalizePhoneValue(field.value, country ?? defaultCountry);
    if (normalized && normalized !== field.value) {
      field.onChange(normalized);
    }
  }, [country, defaultCountry, field]);

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-white/70">
        {label} <span className="text-brand">*</span>
      </label>

      <PhoneInput
        {...field}
        value={(field.value || undefined) as Value | undefined}
        onChange={(value) => {
            const v = value ?? '';
            field.onChange(v);
            onExternalChange?.(v);
          }}
        onCountryChange={(nextCountry) => setCountry(nextCountry)}
        defaultCountry={defaultCountry}
        labels={labels}
        flags={flags}
        countrySelectComponent={SearchableCountrySelect}
        countryOptionsOrder={[...priorityCountries, '|', '...']}
        international={false}
        addInternationalOption={false}
        autoComplete="tel"
        name={field.name}
        className={`phone-field ${errorMessage ? 'phone-field-error' : ''}`}
        numberInputProps={{
          placeholder: country === 'BR' ? '(41) 99999-9999' : formatPhoneNumberIntl(field.value || ''),
          className: 'phone-field-input',
        }}
      />

      <AnimatePresence initial={false}>
        {errorMessage ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {errorMessage}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function SearchableCountrySelect({
  value,
  options,
  onChange,
  onFocus,
  onBlur,
  disabled,
  readOnly,
  iconComponent: Icon,
}: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => options.find((option) => !option.divider && option.value === value) ?? options.find((option) => option.value === 'BR'),
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);

    return options.filter((option) => {
      if (option.divider || !option.value) return false;
      if (!normalizedQuery) return true;

      const callingCode = getCountryCallingCode(option.value);
      const haystack = normalizeSearch(`${option.label} ${option.value} +${callingCode}`);
      return haystack.includes(normalizedQuery);
    });
  }, [options, query]);

  useEffect(() => {
    if (!open) return;

    function handleClick(event: MouseEvent) {
      if (wrapperRef.current?.contains(event.target as Node)) return;
      setOpen(false);
      onBlur?.();
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onBlur, open]);

  const selectedCountry = selected?.value;
  const selectedLabel = selected?.label ?? 'Brasil';

  return (
    <div ref={wrapperRef} className="relative shrink-0">
      <button
        type="button"
        disabled={disabled || readOnly}
        onClick={() => {
          setOpen((current) => !current);
          onFocus?.();
        }}
        className="phone-field-country"
        aria-label="Selecionar país do telefone"
        aria-expanded={open}
      >
        {selectedCountry ? (
          <Icon country={selectedCountry} label={selectedLabel} aria-hidden="true" />
        ) : null}
        <span>+{selectedCountry ? getCountryCallingCode(selectedCountry) : '55'}</span>
        <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14 }}
            className="absolute left-0 top-full z-30 mt-2 w-72 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2">
              <Search className="h-4 w-4 text-zinc-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar país ou DDI"
                className="h-9 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                autoComplete="off"
              />
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {filteredOptions.map((option) => {
                const callingCode = getCountryCallingCode(option.value as Country);
                const active = option.value === value;

                return (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                      setQuery('');
                    }}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition ${
                      active ? 'bg-brand/15 text-white' : 'text-zinc-200 hover:bg-zinc-800'
                    }`}
                  >
                    <Icon country={option.value} label={option.label} aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                    <span className="shrink-0 text-xs text-zinc-400">+{callingCode}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function normalizePhoneValue(value: string, country: Country): string | null {
  const phoneNumber = parsePhoneNumber(value, {
    defaultCountry: country,
    extract: false,
  });

  return phoneNumber?.number ?? null;
}

function getPhoneErrorMessage(message: string | undefined, value: string, country?: Country) {
  if (!message) return undefined;
  if (!value) return 'WhatsApp é obrigatório';

  if (country === 'BR') {
    const digits = value.replace(/\D/g, '');
    if (digits.startsWith('55') && digits.length < 13) {
      return 'Número inválido para +55 — esperado: (XX) XXXXX-XXXX';
    }
  }

  return message === 'Número de telefone inválido para o país selecionado'
    ? 'Este número não parece válido. Verifique e tente novamente.'
    : message;
}

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
