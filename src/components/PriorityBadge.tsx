import React from 'react';
import { PRIORITY_COLORS } from '../lib/constants';

interface PriorityBadgeProps {
  priority: string;
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const color = PRIORITY_COLORS[priority] || '#999999';

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium capitalize"
      style={{ backgroundColor: `${color}15`, color }}
    >
      {priority === 'critical' && '🔴'}
      {priority === 'high' && '🟡'}
      {priority === 'medium' && '🟠'}
      {priority === 'low' && '⚪'}
      {priority}
    </span>
  );
}
