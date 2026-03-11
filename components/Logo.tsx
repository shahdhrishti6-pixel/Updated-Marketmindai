
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 32 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Hexagon Border - matches the image's clean geometric frame */}
      <path 
        d="M50 5L90 27.5V72.5L50 95L10 72.5V27.5L50 5Z" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinejoin="round"
      />
      
      {/* Top Center Circuit Traces (3 Vertical lines with nodes) */}
      <path d="M41 32V21" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="41" cy="21" r="2.5" fill="currentColor" />
      
      <path d="M50 32V14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="14" r="2.5" fill="currentColor" />
      
      <path d="M59 32V21" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="59" cy="21" r="2.5" fill="currentColor" />

      {/* Main 'M' Cyber Structure */}
      {/* The central 'V' valley */}
      <path 
        d="M32 42L50 62L68 42" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />

      {/* Side arms and shoulders of the 'M' */}
      <path 
        d="M24 45V72L40 82" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M76 45V72L60 82" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />

      {/* Shoulder nodes (horizontal extensions) */}
      <path d="M24 45L34 45" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="34" cy="45" r="2.5" fill="currentColor" />

      <path d="M76 45L66 45" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="66" cy="45" r="2.5" fill="currentColor" />

      {/* Bottom Center Node (extending from the V point) */}
      <path d="M50 62V82" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="82" r="3" fill="currentColor" />

      {/* Connection Traces to the Hexagon Corners */}
      <path d="M10 50L24 58" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M90 50L76 58" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};

export default Logo;
