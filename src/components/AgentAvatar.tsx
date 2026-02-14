import React from 'react';
import { AGENT_COLORS } from '../lib/constants';

interface AgentAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

export default function AgentAvatar({ name, size = 'md', showName = false }: AgentAvatarProps) {
  const color = AGENT_COLORS[name.toLowerCase()] || '#999999';
  const initial = name.charAt(0).toUpperCase();
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold`}
        style={{ backgroundColor: `${color}20`, color, border: `2px solid ${color}` }}
      >
        {initial}
      </div>
      {showName && (
        <span className="text-sm font-medium capitalize" style={{ color }}>
          {name}
        </span>
      )}
    </div>
  );
}
