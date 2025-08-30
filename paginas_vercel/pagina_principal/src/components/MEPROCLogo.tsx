import React from 'react';

interface MEPROCLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const MEPROCLogo: React.FC<MEPROCLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <svg 
      className={`${sizeClasses[size]} ${className}`}
      viewBox="0 0 120 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Circle */}
      <circle cx="60" cy="60" r="58" fill="url(#gradient1)" stroke="#1e3a8a" strokeWidth="4"/>
      
      {/* Cross */}
      <rect x="55" y="25" width="10" height="35" rx="2" fill="#f59e0b"/>
      <rect x="40" y="40" width="40" height="10" rx="2" fill="#f59e0b"/>
      
      {/* Book/Education Symbol */}
      <rect x="30" y="65" width="60" height="35" rx="4" fill="#ffffff" stroke="#1e3a8a" strokeWidth="2"/>
      <rect x="35" y="70" width="50" height="3" rx="1" fill="#1e3a8a"/>
      <rect x="35" y="77" width="50" height="3" rx="1" fill="#1e3a8a"/>
      <rect x="35" y="84" width="35" height="3" rx="1" fill="#1e3a8a"/>
      <rect x="35" y="91" width="45" height="3" rx="1" fill="#1e3a8a"/>
      
      {/* Graduation Cap */}
      <path d="M45 62 L60 57 L75 62 L75 67 L60 72 L45 67 Z" fill="#1e3a8a"/>
      <rect x="74" y="62" width="2" height="8" fill="#1e3a8a"/>
      <circle cx="76" cy="70" r="2" fill="#f59e0b"/>
      
      {/* Gradient Definition */}
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#3b82f6'}} />
          <stop offset="100%" style={{stopColor:'#1e40af'}} />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default MEPROCLogo;