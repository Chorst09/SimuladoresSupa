"use client"

import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  unit?: string;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, type = 'text', name, value, onChange, placeholder, icon, unit, step = "0.01", disabled = false, className, ...props }, ref) => (
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor={name} className="text-sm font-medium text-muted-foreground ml-1">{label}</Label>
      <div className="relative flex items-center">
        {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">{icon}</div>}
        <Input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          step={step}
          disabled={disabled}
          ref={ref}
          className={cn(
            icon ? 'pl-10' : 'pl-3',
            unit ? 'pr-12' : 'pr-3',
            className
          )}
          {...props}
        />
        {unit && <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground text-sm">{unit}</span>}
      </div>
    </div>
  )
);

InputField.displayName = "InputField";

export default InputField;
