"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface CustomSelectProps {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

/**
 * Custom Select component that wraps shadcn Select
 * and provides a simpler API similar to native select
 */
export function CustomSelect({
  id,
  value,
  onValueChange,
  placeholder = "Select an option",
  className,
  children,
  disabled = false,
}: CustomSelectProps) {
  // Extract options from children
  const { options, emptyLabel } = React.useMemo(() => {
    const opts: Array<{ value: string; label: string }> = [];
    let emptyOptionLabel = '';
    
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === 'option') {
        const props = child.props as { value?: string; children?: React.ReactNode };
        const optionValue = props.value || '';
        const optionLabel = (props.children as string) || props.value || '';
        
        // Handle empty string values specially
        if (optionValue === '') {
          emptyOptionLabel = optionLabel;
        } else {
          opts.push({
            value: optionValue,
            label: optionLabel,
          });
        }
      }
    });
    
    return { options: opts, emptyLabel: emptyOptionLabel };
  }, [children]);

  // Use empty label as placeholder if provided, otherwise use the placeholder prop
  const effectivePlaceholder = emptyLabel || placeholder;

  // Handle value change
  const handleValueChange = (newValue: string) => {
    // If the special "clear" value is selected, pass empty string
    if (newValue === '__clear__') {
      onValueChange('');
    } else {
      onValueChange(newValue);
    }
  };

  // Convert empty string value to undefined for Radix Select
  const selectValue = value === '' ? undefined : value;

  return (
    <Select value={selectValue} onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger
        id={id}
        className={cn(
          "h-12 border bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300 rounded-lg",
          className
        )}
      >
        <SelectValue placeholder={effectivePlaceholder} />
      </SelectTrigger>
      <SelectContent>
        {/* Add clear option if there was an empty value option */}
        {emptyLabel && (
          <SelectItem value="__clear__">
            {emptyLabel}
          </SelectItem>
        )}
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
