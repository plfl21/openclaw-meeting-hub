import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function GlassCard({ children, className = '', hover = true, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-card/95 border border-accent-primary/10 rounded-xl backdrop-blur-lg p-6
        transition-all duration-300
        ${hover ? 'hover:shadow-[0_0_20px_rgba(255,191,0,0.1)] hover:border-accent-primary/20 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
