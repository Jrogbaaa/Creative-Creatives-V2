'use client';

import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { ChevronDown, Check } from 'lucide-react';

// Select Context
interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  placeholder?: string;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

const useSelectContext = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('Select components must be used within a Select provider');
  }
  return context;
};

// Select Root Component
interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({ 
  value: controlledValue, 
  onValueChange, 
  defaultValue = '',
  children,
  disabled = false
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [open]);

  const contextValue: SelectContextType = {
    value,
    onValueChange: handleValueChange,
    open,
    setOpen: disabled ? () => {} : setOpen,
    triggerRef,
    placeholder: ''
  };

  return (
    <SelectContext.Provider value={contextValue}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

// Select Trigger
interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, className = '' }) => {
  const { open, setOpen, triggerRef } = useSelectContext();

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => setOpen(!open)}
      className={`
        flex items-center justify-between w-full px-3 py-2 text-left
        bg-white border border-gray-300 rounded-md shadow-sm
        hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      aria-haspopup="listbox"
      aria-expanded={open}
    >
      {children}
      <ChevronDown 
        className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} 
      />
    </button>
  );
};

// Select Value
interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

const SelectValue: React.FC<SelectValueProps> = ({ placeholder = 'Select...', className = '' }) => {
  const { value } = useSelectContext();
  
  return (
    <span className={`block truncate ${!value ? 'text-gray-500' : 'text-gray-900'} ${className}`}>
      {value || placeholder}
    </span>
  );
};

// Select Content
interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
  position?: 'top' | 'bottom';
}

const SelectContent: React.FC<SelectContentProps> = ({ 
  children, 
  className = '',
  position = 'bottom'
}) => {
  const { open, triggerRef } = useSelectContext();
  const [maxHeight, setMaxHeight] = useState<number>(200);

  useEffect(() => {
    if (open && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      if (position === 'bottom') {
        const spaceBelow = viewportHeight - triggerRect.bottom - 10;
        setMaxHeight(Math.min(200, Math.max(100, spaceBelow)));
      } else {
        const spaceAbove = triggerRect.top - 10;
        setMaxHeight(Math.min(200, Math.max(100, spaceAbove)));
      }
    }
  }, [open, position]);

  if (!open) return null;

  return (
    <div
      className={`
        absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg
        ${position === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'}
        ${className}
      `}
      style={{ maxHeight: `${maxHeight}px` }}
    >
      <div className="py-1 overflow-auto" style={{ maxHeight: `${maxHeight - 2}px` }}>
        {children}
      </div>
    </div>
  );
};

// Select Item
interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const SelectItem: React.FC<SelectItemProps> = ({ 
  value: itemValue, 
  children, 
  className = '',
  disabled = false
}) => {
  const { value: selectedValue, onValueChange } = useSelectContext();
  const isSelected = selectedValue === itemValue;

  const handleClick = () => {
    if (!disabled) {
      onValueChange(itemValue);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative flex items-center px-3 py-2 cursor-pointer select-none
        hover:bg-gray-100 focus:bg-gray-100
        ${isSelected ? 'bg-purple-50 text-purple-900' : 'text-gray-900'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      role="option"
      aria-selected={isSelected}
    >
      <span className="flex-1 truncate">
        {children}
      </span>
      {isSelected && (
        <Check className="w-4 h-4 text-purple-600 ml-2 flex-shrink-0" />
      )}
    </div>
  );
};

// Select Separator
const SelectSeparator: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <div className={`h-px bg-gray-200 mx-1 my-1 ${className}`} />;
};

// Select Label
interface SelectLabelProps {
  children: React.ReactNode;
  className?: string;
}

const SelectLabel: React.FC<SelectLabelProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-3 py-2 text-sm font-semibold text-gray-500 ${className}`}>
      {children}
    </div>
  );
};

export {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
