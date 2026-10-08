import React from 'react';

interface DiaferaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  variant?: 'badge' | 'horizontal' | 'icon-only';
  inverted?: boolean;
}

export const DiaferaLogo: React.FC<DiaferaLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  variant = 'horizontal',
}) => {
  // Dimension definitions
  const badgeSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const textSizes = {
    sm: { main: 'text-xs tracking-[0.2em]', sub: 'text-[7px] tracking-[0.18em]' },
    md: { main: 'text-sm sm:text-base tracking-[0.22em]', sub: 'text-[8px] sm:text-[9px] tracking-[0.25em]' },
    lg: { main: 'text-lg sm:text-xl tracking-[0.25em]', sub: 'text-[10px] tracking-[0.28em]' },
    xl: { main: 'text-2xl sm:text-3xl tracking-[0.28em]', sub: 'text-xs tracking-[0.3em]' },
  };

  // The Exact Circular Profile Badge matching https://www.instagram.com/diaferastudio/
  const renderCircleBadge = (badgeClass = '') => (
    <div
      className={`rounded-full bg-white text-black flex flex-col items-center justify-center shrink-0 shadow-sm select-none border border-zinc-200/50 ${badgeClass || badgeSizeClasses[size]}`}
      style={{ aspectRatio: '1 / 1' }}
    >
      <span className="font-sans font-black tracking-[0.18em] leading-none text-black" style={{ fontSize: size === 'sm' ? '8px' : size === 'md' ? '10.5px' : size === 'lg' ? '14px' : '19px' }}>
        DIAFÉRA
      </span>
      {size !== 'sm' && (
        <span
          className="font-sans font-light tracking-[0.14em] text-zinc-800 leading-none mt-[2px] opacity-80"
          style={{ fontSize: size === 'md' ? '5.5px' : size === 'lg' ? '7.5px' : '9.5px' }}
        >
          studio &mdash; space
        </span>
      )}
    </div>
  );

  if (variant === 'badge' || variant === 'icon-only') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{renderCircleBadge()}</div>;
  }

  // Horizontal variant (White circular badge + clean sleek wordmark)
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {renderCircleBadge()}
      <div className="flex flex-col select-none">
        <span className={`font-sans font-extrabold text-white leading-none ${textSizes[size].main}`}>
          DIAFÉRA
        </span>
        {showSubtitle && (
          <span className={`font-mono uppercase text-zinc-400 font-light mt-1 leading-none ${textSizes[size].sub}`}>
            studio &mdash; space
          </span>
        )}
      </div>
    </div>
  );
};
