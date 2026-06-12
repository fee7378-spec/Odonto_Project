import React, { useState, useEffect } from 'react';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number | '';
  onChangeValue: (val: number | '') => void;
}

export default function CurrencyInput({ value, onChangeValue, className, ...props }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value === '') {
      setDisplayValue('');
    } else if (typeof value === 'number') {
      const formatted = value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true });
      if (displayValue !== formatted) {
        setDisplayValue(formatted);
      }
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    // Remove tudo que não for dígito
    const digits = val.replace(/\D/g, '');
    
    if (!digits) {
      setDisplayValue('');
      onChangeValue('');
      return;
    }

    const num = parseInt(digits, 10) / 100;
    
    setDisplayValue(num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }));
    onChangeValue(num);
  };

  const handleBlur = () => {
    // A formatação já está sempre correta devido ao handleChange
  };

  return (
    <input
      type="text"
      className={className}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      {...props}
    />
  );
}
