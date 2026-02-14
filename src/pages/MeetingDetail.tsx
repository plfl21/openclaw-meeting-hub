import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Square, Plus, X } from 'lucide-react';
import { usePolling } from '../hooks/usePolling';
import { api, withFallback } from '../lib/api';
import { seedMeetingDetail } from '../lib/seed-data';
import { AGENT_COLORS } from '../lib/constants';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import AgentAvatar from '../components/AgentAvatar';
import PriorityBadge from '../components/PriorityBadge';

export default function MeetingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showTurnForm, setShowTurnForm] = useState(false);
  const [turnContent, setTurnContent] = useState('');
  const [turnType, setTurnType] = useState('statement');

  const [showDecisionForm, setShowDecisionForm] = useState(false);
  const [decisionTitle, setDecisionTitle] = useState('');
  const [decisionDesc, setDecisionDesc] = useState('');

  const [showActionForm, setShowActionForm] = useState(false);
  const [actionTitle, setActionTitle] = useState('');
  const [actionPriority, setActionPriority] = useState('medium');
  const [actionAgent, setActionAgent] = useState('');

  const fetchMeeting = useCallback(
    () => withFallback(() => api<any>(`/api/meeting-hub/meetings/${id}`), seedMeetingDetail),
    [id]
  );
  const { data: meeting, refresh } = usePolling(fetchMeeting, 15000);

  const handleStart = async () => {
    try {
      await api(`/api/meeting-hub/meetings/${id}/start`, { method: 'POST' });
      refresh();
    } catch (e) { console.error(e); }
  };

  const handleEnd = async () => {
    try {
      await api(`/api/meeting-hub/meetings/${id}/end`, { method: 'POST' });
      refresh();
    } catch (e) { console.error(e); }
  };

  const handleAddTurn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnContent.trim()) return;
    try {
      await api(`/api/meeting-hub/meetings/${id}/turns`, {
        method: 'POST',
        body: JSON.stringify({ content: turnContent, turn_type: turnType, phase: 'discussion' }),
      });
      setTurnContent('');
      setShowTurnForm(false);
      refresh();
    } catch (e) { console.error(e); }
  };

  const handleAddDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionTitle.trim()) return;
    try {
      await api(`/api/meeting-hub/meetings/${id}/decisions`, {
        method: 'POST',
        body: JSON.stringify({ title: decisionTitle, description: decisionDesc }),
      });
      setDecisionTitle('');
      setDecisionDesc('');
      setShowDecisionForm(false);
      refresh();
    } catch (e) { console.error(e); }
  };

  const handleAddAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTitle.trim()) return;
    try {
      await api(`/api/meeting-hub/meetings/${id}/action-items`, {
        method: 'POST',
        body: JSON.stringify({ title: actionTitle, priority: actionPriority, assigned_agent: actionAgent || undefined }),
      });
      setActionTitle('');
      setActionAgent('');
      setShowActionForm(false);
      refresh();
    } catch (e) { console.error(e); }
  };

  const m = meeting || seedMeetingDetail;

  const getParticipantName = (pid: string) => {
    const p = m.participants?.find((pp: any) => pp.id === pid);
    return p?.display_name || 'Unknown';
  };

  const getParticipantAgent = (pid: string) => {
    const p = m.participants?.find((pp: any) => pp.id === pid);
    return p?.agent_id || p?.display_name?.toLowerCase() || '';
  };

  const statusActions: Record<string, any[]> = {
    draft: [{ label: 'Start Meeting', icon: Play, action: handleStart, color: 'btn-primary' }],
    in_progress: [{ label: 'End Meeting', icon: Square, action: handleEnd, color: 'bg-error text-white hover:bg-error/80 rounded-lg px-4 py-2 font-semibold transition-all' }],
    completed: [],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/meetings')} className="p-2 rounded-lg hover:bg-elevated text-text-secondary">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-accent-primary">{m.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            <StatusBadge status={m.status} />
            <span className="text-sm text-text-muted capitalize">{m.meeting_type}</span>
            {m.started_at && (
              <span className="text-xs text-text-muted">
                Started: {new Date(m.started_at).toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {(statusActions[m.status] || []).map((a: any, i: number) => (
            <button key={i} onClick={a.action} className={`${a.color} flex items-center gap-2 text-sm px-4 py-2`}>
              <a.icon className="w-4 h-4" /> {a.label}
            </button>
          ))}
        </div>
      </div>

      {m.description && (
        <p className="text-text-secondary">{m.description}</p>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-accent-primary">Discussion</h2>
              <button onClick={() => setShowTurnForm(!showTurnForm)} className="text-sm text-accent-secondary hover:underline flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Turn
              </button>
            </div>

            {showTurnForm && (
              <form onSubmit={handleAddTurn} className="mb-4 p-4 bg-elevated rounded-lg space-y-3">
                <select
                  value={turnType}
                  onChange={e => setTurnType(e.target.value)}
                  className="w-full px-3 py-2 bg-darkest border border-accent-primary/10 rounded-lg text-text-primary text-sm"
                >
                  {['statement', 'question', 'proposal', 'vote', 'objection', 'summary', 'action'].map(t => (
                    <option key={t} value={t} className="bg-darkest">{t}</option>
                  ))}
                </select>
                <textarea
                  value={turnContent}
                  onChange={e => setTurnContent(e.target.value)}
                  className="w-full px-3 py-2 bg-darkest border border-accent-primary/10 rounded-lg text-text-primary text-sm resize-none"
                  rows={3}
                  placeholder="What would you like to say?"
                />
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary text-sm px-4 py-2">Submit</button>
                  <button type="button" onClick={() => setShowTurnForm(false)} className="btn-secondary text-sm px-4 py-2">Cancel</button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {(m.turns || []).map((turn: any) => {
                const name = getParticipantName(turn.participant_id);
                const agent = getParticipantAgent(turn.participant_id);
                const color = AGENT_COLORS[agent] || '#999';
                return (
                  <div key={turn.id} className="flex items-start gap-3 p-3 rounded-lg bg-elevated/50" style={{ borderLeft: `3px solid ${color}` }}>
                    <AgentAvatar name={name} size="sm" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium" style={{ color }}>{name}</span>
                        <StatusBadge status={turn.turn_type} size="sm" />
                        <span className="text-xs text-text-muted">#{turn.turn_number}</span>
                      </div>
                      <p className="text-sm text-text-primary">{turn.content}</p>
                    </div>
                    <span className="text-xs text-text-muted whitespace-nowrap">
                      {new Date(turn.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              {(!m.turns || m.turns.length === 0) && (
                <p className="text-center text-text-muted py-8">No discussion turns yet</p>
              )}
            </div>
          </GlassCard>

          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-accent-primary">Decisions</h2>
              <button onClick={() => setShowDecisionForm(!showDecisionForm)} className="text-sm text-accent-secondary hover:underline flex items-center gap-1">
                <Plus className="w-4 h-4" /> Propose
              </button>
            </div>

            {showDecisionForm && (
              <form onSubmit={handleAddDecision} className="mb-4 p-4 bg-elevated rounded-lg space-y-3">
                <input
                  type="text"
                  value={decisionTitle}
                  onChange={e => setDecisionTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-darkest border border-accent-primary/10 rounded-lg text-text-primary text-sm"
                  placeholder="Decision title"
                />
                <textarea
                  value={decisionDesc}
                  onChange={e => setDecisionDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-darkest border border-accent-primary/10 rounded-lg text-text-primary text-sm resize-none"
                  rows={2}
                  placeholder="Description (optional)"
                />
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary text-sm px-4 py-2">Propose</button>
                  <button type="button" onClick={() => setShowDecisionForm(false)} className="btn-secondary text-sm px-4 py-2">Cancel</button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {(m.decisions || []).map((d: any) => (
                <div key={d.id} className="p-3 rounded-lg bg-elevated/50 border border-accent-primary/5">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-text-primary">{d.title}</h4>
                    <StatusBadge status={d.status} size="sm" />
                  </div>
                  {d.description && <p className="text-xs text-text-secondary">{d.description}</p>}
                </div>
              ))}
              {(!m.decisions || m.decisions.length === 0) && (
                <p className="text-center text-text-muted py-4">No decisions yet</p>
              )}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard hover={false}>
            <h2 className="text-lg font-semibold text-accent-primary mb-4">Participants</h2>
            <div className="space-y-3">
              {(m.participants || []).map((p: any) => {
                const color = AGENT_COLORS[p.agent_id || p.display_name?.toLowerCase()] || '#999';
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <AgentAvatar name={p.display_name} size="md" />
                    <div>
                      <p className="text-sm font-medium" style={{ color }}>{p.display_name}</p>
                      <p className="text-xs text-text-muted">{p.role || p.participant_type}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-accent-primary">Action Items</h2>
              <button onClick={() => setShowActionForm(!showActionForm)} className="text-sm text-accent-secondary hover:underline flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            {showActionForm && (
              <form onSubmit={handleAddAction} className="mb-4 p-3 bg-elevated rounded-lg space-y-2">
                <input
                  type="text"
                  value={actionTitle}
                  onChange={e => setActionTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-darkest border border-accent-primary/10 rounded-lg text-text-primary text-sm"
                  placeholder="Action item title"
                />
                <select
                  value={actionPriority}
                  onChange={e => setActionPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-darkest border border-accent-primary/10 rounded-lg text-text-primary text-sm"
                >
                  {['low', 'medium', 'high', 'critical'].map(p => (
                    <option key={p} value={p} className="bg-darkest">{p}</option>
                  ))}
                </select>
                <select
                  value={actionAgent}
                  onChange={e => setActionAgent(e.target.value)}
                  className="w-full px-3 py-2 bg-darkest border border-accent-primary/10 rounded-lg text-text-primary text-sm"
                >
                  <option value="" className="bg-darkest">Unassigned</option>
                  {['johnny', 'claude', 'replit', 'lovable', 'petro'].map(a => (
                    <option key={a} value={a} className="bg-darkest capitalize">{a}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary text-sm px-3 py-1.5">Add</button>
                  <button type="button" onClick={() => setShowActionForm(false)} className="btn-secondary text-sm px-3 py-1.5">Cancel</button>
                </div>
              </form>
            )}

            {['pending', 'in_progress', 'completed'].map(status => {
              const items = (m.action_items || []).filter((ai: any) => ai.status === status);
              if (items.length === 0) return null;
              return (
                <div key={status} className="mb-4">
                  <h4 className="text-xs font-semibold text-text-muted uppercase mb-2">{status.replace(/_/g, ' ')}</h4>
                  <div className="space-y-2">
                    {items.map((ai: any) => (
                      <div key={ai.id} className="p-2 rounded-lg bg-elevated/50 border border-accent-primary/5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-primary">{ai.title}</span>
                          <PriorityBadge priority={ai.priority} />
                        </div>
                        {ai.assigned_agent && (
                          <div className="mt-1">
                            <AgentAvatar name={ai.assigned_agent} size="sm" showName />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
