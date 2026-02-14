import React from 'react';
import { LucideIcon } from 'lucide-react';
import GlassCard from './GlassCard';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
  trend?: { value: number; label: string };
}

export default function StatCard({ title, value, subtitle, icon: Icon, color = '#ffbf00', trend }: StatCardProps) {
  return (
    <GlassCard hover={false}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-text-secondary text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold" style={{ color }}>{value}</p>
          {subtitle && <p className="text-text-muted text-xs mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trend.value >= 0 ? 'text-success' : 'text-error'}`}>
              <span>{trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className="text-text-muted">{trend.label}</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </GlassCard>
  );
}
