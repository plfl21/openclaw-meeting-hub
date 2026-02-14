import React, { useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { BarChart3, Users, MessageSquare, Zap, CheckCircle, Clock } from 'lucide-react';
import { usePolling } from '../hooks/usePolling';
import { api, withFallback } from '../lib/api';
import { AGENT_COLORS } from '../lib/constants';
import {
  seedAnalyticsOverview, seedActivityTimeline, seedAgentWorkload,
  seedTurnTypes, seedDecisionOutcomes, seedJobExecutions,
} from '../lib/seed-data';
import StatCard from '../components/StatCard';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';

const PIE_COLORS = ['#ffbf00', '#00ffd5', '#a78bfa', '#ec4899', '#10b981', '#ef4444'];

export default function Analytics() {
  const fetchOverview = useCallback(() => withFallback(() => api<any>('/api/meeting-hub/analytics/overview'), seedAnalyticsOverview), []);
  const fetchTimeline = useCallback(() => withFallback(() => api<any[]>('/api/meeting-hub/analytics/activity-timeline'), seedActivityTimeline), []);
  const fetchWorkload = useCallback(() => withFallback(() => api<any[]>('/api/meeting-hub/analytics/agent-workload'), seedAgentWorkload), []);
  const fetchTurnTypes = useCallback(() => withFallback(() => api<any[]>('/api/meeting-hub/analytics/turn-types'), seedTurnTypes), []);
  const fetchDecisions = useCallback(() => withFallback(() => api<any[]>('/api/meeting-hub/analytics/decision-outcomes'), seedDecisionOutcomes), []);
  const fetchJobs = useCallback(() => withFallback(() => api<any[]>('/api/meeting-hub/analytics/job-executions'), seedJobExecutions), []);

  const { data: overview } = usePolling(fetchOverview, 60000);
  const { data: timeline } = usePolling(fetchTimeline, 60000);
  const { data: workload } = usePolling(fetchWorkload, 60000);
  const { data: turnTypes } = usePolling(fetchTurnTypes, 60000);
  const { data: decisions } = usePolling(fetchDecisions, 60000);
  const { data: jobs } = usePolling(fetchJobs, 60000);

  const ov = overview || seedAnalyticsOverview;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-accent-primary">Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Meetings" value={ov.meetings?.total || '0'} subtitle={`${ov.meetings?.active || 0} active`} icon={Users} color="#ffbf00" />
        <StatCard title="Decisions" value={ov.decisions?.total || '0'} subtitle={`${ov.decisions?.approved || 0} approved`} icon={CheckCircle} color="#00ffd5" />
        <StatCard title="Action Items" value={ov.actionItems?.total || '0'} subtitle={`${ov.actionItems?.done || 0} completed`} icon={Zap} color="#a78bfa" />
        <StatCard title="Job Executions" value={ov.jobs?.total || '0'} subtitle={`${ov.jobs?.completed || 0} successful`} icon={Clock} color="#10b981" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard hover={false}>
          <h2 className="text-lg font-semibold text-accent-primary mb-4">Activity Timeline</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline || seedActivityTimeline}>
                <XAxis dataKey="day" tick={{ fill: '#666', fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#141416', border: '1px solid rgba(255,191,0,0.2)', borderRadius: 8 }} />
                <Legend />
                <Line type="monotone" dataKey="turns" stroke="#ffbf00" strokeWidth={2} dot={false} name="Turns" />
                <Line type="monotone" dataKey="meetings" stroke="#00ffd5" strokeWidth={2} dot={false} name="Meetings" />
                <Line type="monotone" dataKey="jobs" stroke="#a78bfa" strokeWidth={2} dot={false} name="Jobs" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <h2 className="text-lg font-semibold text-accent-primary mb-4">Agent Workload</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(workload || seedAgentWorkload).map((a: any) => ({ ...a, done: Number(a.done), pending: Number(a.pending), in_progress: Number(a.in_progress) }))}>
                <XAxis dataKey="agent" tick={{ fill: '#999', fontSize: 12 }} />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#141416', border: '1px solid rgba(255,191,0,0.2)', borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="done" fill="#10b981" name="Done" radius={[2, 2, 0, 0]} />
                <Bar dataKey="in_progress" fill="#ffbf00" name="In Progress" radius={[2, 2, 0, 0]} />
                <Bar dataKey="pending" fill="#666666" name="Pending" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <h2 className="text-lg font-semibold text-accent-primary mb-4">Turn Type Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={(turnTypes || seedTurnTypes).map((t: any) => ({ ...t, count: Number(t.count) }))}
                  dataKey="count"
                  nameKey="turn_type"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ turn_type, percent }: any) => `${turn_type} ${(percent * 100).toFixed(0)}%`}
                >
                  {(turnTypes || seedTurnTypes).map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#141416', border: '1px solid rgba(255,191,0,0.2)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <h2 className="text-lg font-semibold text-accent-primary mb-4">Decision Outcomes</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(decisions || seedDecisionOutcomes).map((d: any) => ({ ...d, count: Number(d.count) }))} layout="vertical">
                <XAxis type="number" tick={{ fill: '#666', fontSize: 11 }} />
                <YAxis dataKey="status" type="category" tick={{ fill: '#999', fontSize: 12 }} width={80} />
                <Tooltip contentStyle={{ background: '#141416', border: '1px solid rgba(255,191,0,0.2)', borderRadius: 8 }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {(decisions || seedDecisionOutcomes).map((d: any, i: number) => (
                    <Cell key={i} fill={d.status === 'approved' ? '#10b981' : d.status === 'rejected' ? '#ef4444' : '#a78bfa'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <GlassCard hover={false}>
        <h2 className="text-lg font-semibold text-accent-primary mb-4">Recent Job Executions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-muted border-b border-accent-primary/10">
                <th className="py-2 pr-4">Workflow</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Duration</th>
                <th className="py-2 pr-4">Steps</th>
                <th className="py-2 pr-4">Trigger</th>
                <th className="py-2">Started</th>
              </tr>
            </thead>
            <tbody>
              {(jobs || seedJobExecutions).map((job: any) => (
                <tr key={job.id} className="border-b border-accent-primary/5 hover:bg-elevated/30">
                  <td className="py-2.5 pr-4 font-mono text-xs text-text-primary">{job.workflow_name}</td>
                  <td className="py-2.5 pr-4"><StatusBadge status={job.status} size="sm" /></td>
                  <td className="py-2.5 pr-4 text-text-secondary">{job.duration_ms ? `${(job.duration_ms / 1000).toFixed(1)}s` : '-'}</td>
                  <td className="py-2.5 pr-4 text-text-secondary">{job.steps_completed}/{job.steps_total}</td>
                  <td className="py-2.5 pr-4 text-text-muted capitalize">{job.trigger_type}</td>
                  <td className="py-2.5 text-text-muted">{new Date(job.started_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
