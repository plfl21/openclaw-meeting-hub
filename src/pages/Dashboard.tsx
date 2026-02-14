import React, { useCallback } from 'react';
import { Activity, Users, MessageSquare, Zap, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { usePolling } from '../hooks/usePolling';
import { api, withFallback } from '../lib/api';
import { AGENT_COLORS } from '../lib/constants';
import {
  seedServerHealth,
  seedAnalyticsOverview,
  seedActivityTimeline,
  seedNeuronFeed,
  seedAgentWorkload,
} from '../lib/seed-data';
import StatCard from '../components/StatCard';
import GlassCard from '../components/GlassCard';
import AgentAvatar from '../components/AgentAvatar';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

export default function Dashboard() {
  const fetchServer = useCallback(() => withFallback(() => api<any>('/api/metrics/server'), seedServerHealth), []);
  const fetchOverview = useCallback(() => withFallback(() => api<any>('/api/meeting-hub/analytics/overview'), seedAnalyticsOverview), []);
  const fetchTimeline = useCallback(() => withFallback(() => api<any>('/api/meeting-hub/analytics/activity-timeline'), seedActivityTimeline), []);
  const fetchNeuron = useCallback(() => withFallback(() => api<any[]>('/api/neuron/feed?limit=10'), seedNeuronFeed.slice(0, 10)), []);
  const fetchWorkload = useCallback(() => withFallback(() => api<any[]>('/api/meeting-hub/analytics/agent-workload'), seedAgentWorkload), []);

  const { data: server } = usePolling(fetchServer, 30000);
  const { data: overview } = usePolling(fetchOverview, 60000);
  const { data: timeline } = usePolling(fetchTimeline, 60000);
  const { data: neuronFeed } = usePolling(fetchNeuron, 15000);
  const { data: workload } = usePolling(fetchWorkload, 60000);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-accent-primary">Command Center</h1>
        {server && (
          <StatusBadge status={server.status} />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Meetings"
          value={overview?.meetings?.total || '0'}
          subtitle={`${overview?.meetings?.active || 0} active`}
          icon={Users}
          color="#ffbf00"
        />
        <StatCard
          title="Action Items"
          value={overview?.actionItems?.total || '0'}
          subtitle={`${overview?.actionItems?.in_progress || 0} in progress`}
          icon={CheckCircle}
          color="#00ffd5"
        />
        <StatCard
          title="Neuron Messages"
          value={overview?.turns?.total || '0'}
          subtitle="Total communications"
          icon={MessageSquare}
          color="#a78bfa"
        />
        <StatCard
          title="Workflow Success"
          value={`${overview?.jobs?.total ? Math.round((Number(overview.jobs.completed) / Number(overview.jobs.total)) * 100) : 90}%`}
          subtitle={`${overview?.jobs?.completed || 0}/${overview?.jobs?.total || 0} completed`}
          icon={Zap}
          color="#10b981"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2" hover={false}>
          <h2 className="text-lg font-semibold text-accent-primary mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity Timeline (30 Days)
          </h2>
          <div className="h-64">
            {timeline && timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeline}>
                  <XAxis
                    dataKey="day"
                    tick={{ fill: '#666', fontSize: 11 }}
                    tickFormatter={(v: string) => v.slice(5)}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fill: '#666', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#141416', border: '1px solid rgba(255,191,0,0.2)', borderRadius: 8 }}
                    labelStyle={{ color: '#e0e0e0' }}
                  />
                  <Line type="monotone" dataKey="turns" stroke="#ffbf00" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="meetings" stroke="#00ffd5" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="jobs" stroke="#a78bfa" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-text-muted">Loading chart...</div>
            )}
          </div>
          <div className="flex items-center gap-6 mt-3 text-xs text-text-secondary">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-accent-primary inline-block" /> Turns</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-accent-secondary inline-block" /> Meetings</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-accent-tertiary inline-block" /> Jobs</span>
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <h2 className="text-lg font-semibold text-accent-primary mb-4">Agent Workload</h2>
          <div className="space-y-4">
            {(workload || seedAgentWorkload).map((agent: any) => {
              const total = Number(agent.total) || 1;
              const done = Number(agent.done);
              const pct = Math.round((done / total) * 100);
              const color = AGENT_COLORS[agent.agent] || '#999';
              return (
                <div key={agent.agent}>
                  <div className="flex items-center justify-between mb-1">
                    <AgentAvatar name={agent.agent} size="sm" showName />
                    <span className="text-xs text-text-secondary">{done}/{total} done</span>
                  </div>
                  <div className="w-full h-2 bg-elevated rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      <GlassCard hover={false}>
        <h2 className="text-lg font-semibold text-accent-primary mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Recent Neuron Feed
        </h2>
        <div className="space-y-3">
          {(neuronFeed || seedNeuronFeed.slice(0, 10)).map((msg: any) => {
            const agentColor = AGENT_COLORS[msg.sender_agent] || '#999';
            return (
              <div
                key={msg.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-elevated/50 border-l-3 transition-colors hover:bg-elevated"
                style={{ borderLeftColor: agentColor, borderLeftWidth: 3 }}
              >
                <AgentAvatar name={msg.sender_agent} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium" style={{ color: agentColor }}>{msg.sender_name}</span>
                    <span className="text-xs text-text-muted">{msg.message_type.replace(/_/g, ' ')}</span>
                    <PriorityBadge priority={msg.priority} />
                  </div>
                  {msg.subject && <p className="text-sm text-text-primary font-medium">{msg.subject}</p>}
                  <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{msg.content}</p>
                </div>
                <span className="text-xs text-text-muted whitespace-nowrap">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
