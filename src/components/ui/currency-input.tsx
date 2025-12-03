import React, { forwardRef, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onChange: (value: number) => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('');

    // Formatar número para moeda brasileira
    const formatCurrency = (num: number): string => {
      if (isNaN(num) || num === 0) return '';
      return num.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    };

    // Converter string formatada para número
    const parseCurrency = (str: string): number => {
      if (!str) return 0;
      // Remove tudo exceto números e vírgula
      const cleaned = str.replace(/[^\d,]/g, '');
      // Substitui vírgula por ponto
      const withDot = cleaned.replace(',', '.');
      const parsed = parseFloat(withDot);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Atualizar display quando value externo mudar
    useEffect(() => {
      setDisplayValue(formatCurrency(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      
      // Permitir apenas números, vírgula e ponto
      const cleaned = input.replace(/[^\d,\.]/g, '');
      
      // Se estiver vazio, limpar
      if (!cleaned) {
        setDisplayValue('');
        onChange(0);
        return;
      }
      
      // Separar parte inteira e decimal
      const parts = cleaned.split(/[,\.]/);
      let formatted = parts[0]; // Parte inteira (sem limite de dígitos)
      
      if (parts.length > 1) {
        // Pegar apenas os primeiros 2 dígitos decimais
        const decimals = parts[1].substring(0, 2);
        formatted = `${parts[0]},${decimals}`;
      } else if (cleaned.includes(',') || cleaned.includes('.')) {
        // Se terminou com vírgula ou ponto, manter
        formatted = `${parts[0]},`;
      }
      
      setDisplayValue(formatted);
      
      // Converter e enviar o valor numérico
      const numericValue = parseCurrency(formatted);
      onChange(numericValue);
    };

    const handleBlur = () => {
      // Formatar completamente ao sair do campo
      const numericValue = parseCurrency(displayValue);
      setDisplayValue(formatCurrency(numericValue));
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cn(className)}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
