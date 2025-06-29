import React, { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';

interface QuantitySelectorProps {
  initialQuantity?: number;
  min?: number;
  max?: number;
  onChange: (quantity: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  initialQuantity = 1,
  min = 1,
  max = 99,
  onChange,
  disabled = false,
  size = 'md',
  className = ''
}) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg'
  };

  const buttonSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= min && newQuantity <= max) {
      setQuantity(newQuantity);
      onChange(newQuantity);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || min;
    handleQuantityChange(value);
  };

  const increment = () => {
    if (quantity < max) {
      handleQuantityChange(quantity + 1);
    }
  };

  const decrement = () => {
    if (quantity > min) {
      handleQuantityChange(quantity - 1);
    }
  };

  return (
    <div className={`flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white ${className}`}>
      <button
        type="button"
        onClick={decrement}
        disabled={disabled || quantity <= min}
        className={`
          ${buttonSizeClasses[size]} 
          flex items-center justify-center 
          bg-gray-50 hover:bg-gray-100 
          disabled:opacity-50 disabled:cursor-not-allowed 
          transition-colors duration-200
          border-r border-gray-300
        `}
      >
        <Minus className={`${iconSizeClasses[size]} text-gray-600`} />
      </button>
      
      <input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        min={min}
        max={max}
        disabled={disabled}
        className={`
          ${sizeClasses[size]} 
          w-16 text-center border-0 focus:ring-0 focus:outline-none 
          disabled:opacity-50 disabled:cursor-not-allowed
          font-semibold text-gray-900
        `}
      />
      
      <button
        type="button"
        onClick={increment}
        disabled={disabled || quantity >= max}
        className={`
          ${buttonSizeClasses[size]} 
          flex items-center justify-center 
          bg-gray-50 hover:bg-gray-100 
          disabled:opacity-50 disabled:cursor-not-allowed 
          transition-colors duration-200
          border-l border-gray-300
        `}
      >
        <Plus className={`${iconSizeClasses[size]} text-gray-600`} />
      </button>
    </div>
  );
};

export default QuantitySelector;