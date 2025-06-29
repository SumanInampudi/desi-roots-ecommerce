import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <img
          src="/image.png"
          alt="Desi Roots Logo"
          className="w-full h-full object-contain drop-shadow-lg"
        />
      </div>
      <div className="ml-3 flex flex-col">
        <span className={`font-bold bg-gradient-to-r from-green-800 to-green-600 bg-clip-text text-transparent ${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl'}`}>
          Desi Roots
        </span>
        <span className={`${textSizes[size]} text-green-700 font-serif italic tracking-wide -mt-1 opacity-80`}>
          The Authentic Taste of Guntur Spice
        </span>
      </div>
    </div>
  );
};

export default Logo;