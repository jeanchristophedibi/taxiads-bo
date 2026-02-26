'use client';

import ReactSelect from 'react-select';
import type { OptionItem } from '@/shared/application/use-options-query';

interface Props {
  options: OptionItem[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export function SelectField({ options, value, onChange, placeholder = '— Sélectionner —', isLoading }: Props) {
  const selectOptions = options.map((o) => ({ value: o.key, label: o.value }));
  const selected = selectOptions.find((o) => o.value === value) ?? null;

  return (
    <ReactSelect
      options={selectOptions}
      value={selected}
      onChange={(opt) => onChange(opt?.value ?? '')}
      placeholder={placeholder}
      isLoading={isLoading}
      isClearable
      menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
      menuPosition="fixed"
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
      classNames={{
        control: (state) =>
          `min-h-[40px] border border-slate-300 rounded-md bg-white text-sm flex items-center
           ${state.isFocused ? 'border-blue-500 ring-2 ring-blue-500' : 'hover:border-slate-400'}`,
        valueContainer: () => 'px-2',
        indicatorsContainer: () => 'px-2',
        dropdownIndicator: () => 'text-slate-500',
        clearIndicator: () => 'text-slate-400 hover:text-slate-600',
        menu: () =>
          'rounded-md shadow-lg border border-slate-200 bg-white mt-1 z-50',
        option: (state) =>
          `text-sm cursor-pointer px-2 py-1
           ${state.isSelected ? 'bg-blue-600 text-white' :
             state.isFocused ? 'bg-slate-100 text-slate-900' : 'text-slate-700'}`,
        placeholder: () => 'text-slate-400 text-sm',
        singleValue: () => 'text-slate-900 text-sm',
        input: () => 'text-sm',
      }}
      unstyled
    />
  );
}
