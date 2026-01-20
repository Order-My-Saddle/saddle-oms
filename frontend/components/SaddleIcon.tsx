import React from 'react';

export function SaddleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      width={props.width || 24}
      height={props.height || 24}
      {...props}
    >
      {/* Zadel-vorm */}
      <path d="M14 38c2 10 16 16 28 12s10-16 10-24c0-8-6-17-13-17-7 0-10 6-14 8-4 2-8 2-10 8s-3 13-1 13z"/>
      {/* Stijgbeugel */}
      <rect x="28" y="50" width="8" height="10" rx="3" />
      <rect x="30" y="46" width="4" height="6" rx="2" />
    </svg>
  );
}
