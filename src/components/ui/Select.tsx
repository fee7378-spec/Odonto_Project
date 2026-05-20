import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SelectProps {
  label?: string;
  error?: string;
  className?: string;
  children?: React.ReactNode;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  id?: string;
}

export default function Select({ label, error, className, children, value, onChange, required, disabled, name, id }: SelectProps) {
  return (
    <div className="space-y-1.5 flex-1 min-w-[120px]">
      {label && (
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <select
          className={cn(
            "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500/50",
            error && "border-rose-500 focus:ring-rose-500/20",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          name={name}
          id={id}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 group-hover:text-gold-500 transition-colors">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error && <p className="text-rose-500 text-[10px] font-bold ml-1">{error}</p>}
    </div>
  );
}
