import React, { useCallback, useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { usePolling } from '../hooks/usePolling';
import { api, withFallback } from '../lib/api';
import { seedProposals } from '../lib/seed-data';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';

export default function Proposals() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchProposals = useCallback(
    () => withFallback(() => api<any[]>('/api/meeting-hub/proposals'), seedProposals),
    []
  );

  const { data: proposals } = usePolling(fetchProposals, 60000);
  const allProposals = proposals || seedProposals;
  const selected = allProposals.find((p: any) => p.id === selectedId) || allProposals[0];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-accent-primary flex items-center gap-2">
        <Lightbulb className="w-6 h-6" />
        Proposals
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          {allProposals.map((proposal: any) => (
            <GlassCard
              key={proposal.id}
              onClick={() => setSelectedId(proposal.id)}
              className={`cursor-pointer ${selectedId === proposal.id || (!selectedId && proposal.id === allProposals[0]?.id) ? '!border-accent-primary/40 glow-amber' : ''}`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-text-primary">{proposal.title}</h3>
                <StatusBadge status={proposal.status} size="sm" />
              </div>
              <p className="text-xs text-text-secondary mb-2">{proposal.description}</p>
              <p className="text-xs text-text-muted">
                {new Date(proposal.created_at).toLocaleDateString()}
              </p>
            </GlassCard>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selected && (
            <GlassCard hover={false}>
              <h2 className="text-lg font-semibold text-accent-primary mb-2">{selected.title}</h2>
              <p className="text-sm text-text-secondary mb-4">{selected.description}</p>

              <div className="relative bg-darkest rounded-lg border border-accent-primary/10 overflow-hidden" style={{ minHeight: 300 }}>
                <svg width="100%" height="300" className="absolute inset-0">
                  {(selected.connections || []).map((conn: any, i: number) => {
                    const fromBox = (selected.boxes || []).find((b: any) => b.id === conn.from);
                    const toBox = (selected.boxes || []).find((b: any) => b.id === conn.to);
                    if (!fromBox || !toBox) return null;
                    const x1 = fromBox.x + (fromBox.width || 120) / 2;
                    const y1 = fromBox.y + (fromBox.height || 50) / 2;
                    const x2 = toBox.x + (toBox.width || 120) / 2;
                    const y2 = toBox.y + (toBox.height || 50) / 2;
                    return (
                      <line
                        key={i}
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke="rgba(255,191,0,0.3)"
                        strokeWidth={2}
                        markerEnd="url(#arrowhead)"
                      />
                    );
                  })}
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="rgba(255,191,0,0.5)" />
                    </marker>
                  </defs>
                </svg>

                {(selected.boxes || []).map((box: any) => (
                  <div
                    key={box.id}
                    className="absolute flex items-center justify-center rounded-lg border text-sm font-medium text-center px-2"
                    style={{
                      left: box.x,
                      top: box.y,
                      width: box.width || 120,
                      height: box.height || 50,
                      backgroundColor: `${box.color}15`,
                      borderColor: `${box.color}40`,
                      color: box.color,
                    }}
                  >
                    {box.label}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
