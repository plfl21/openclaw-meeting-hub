import React, { useState, useCallback } from 'react';
import { Send, Filter } from 'lucide-react';
import { usePolling } from '../hooks/usePolling';
import { api, withFallback } from '../lib/api';
import { seedNeuronFeed } from '../lib/seed-data';
import { AGENT_COLORS, MESSAGE_TYPES } from '../lib/constants';
import GlassCard from '../components/GlassCard';
import AgentAvatar from '../components/AgentAvatar';
import PriorityBadge from '../components/PriorityBadge';

export default function NeuronFeed() {
  const [filterAgent, setFilterAgent] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const [showPostForm, setShowPostForm] = useState(false);
  const [postAgent, setPostAgent] = useState('johnny');
  const [postName, setPostName] = useState('Johnny');
  const [postType, setPostType] = useState('status_update');
  const [postSubject, setPostSubject] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postPriority, setPostPriority] = useState('normal');
  const [posting, setPosting] = useState(false);

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams({ limit: '50' });
    if (filterAgent) params.set('agent', filterAgent);
    if (filterType) params.set('type', filterType);
    return params.toString();
  }, [filterAgent, filterType]);

  const fetchFeed = useCallback(
    () => withFallback(() => api<any[]>(`/api/neuron/feed?${buildQuery()}`), seedNeuronFeed),
    [buildQuery]
  );

  const { data: feed, refresh } = usePolling(fetchFeed, 15000);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    setPosting(true);
    try {
      await api('/api/neuron/post', {
        method: 'POST',
        body: JSON.stringify({
          sender_agent: postAgent,
          sender_name: postName,
          message_type: postType,
          subject: postSubject,
          content: postContent,
          priority: postPriority,
          target_agent: 'all',
        }),
      });
      setPostSubject('');
      setPostContent('');
      setShowPostForm(false);
      refresh();
    } catch (err) {
      console.error('Failed to post:', err);
    } finally {
      setPosting(false);
    }
  };

  const agentNames = ['johnny', 'claude', 'replit', 'lovable', 'petro'];

  const filteredFeed = (feed || seedNeuronFeed).filter((msg: any) => {
    if (filterPriority && msg.priority !== filterPriority) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-accent-primary">Neuron Feed</h1>
        <button onClick={() => setShowPostForm(!showPostForm)} className="btn-primary flex items-center gap-2 text-sm">
          <Send className="w-4 h-4" /> Post Message
        </button>
      </div>

      {showPostForm && (
        <GlassCard hover={false}>
          <h3 className="text-lg font-semibold text-accent-primary mb-4">New Message</h3>
          <form onSubmit={handlePost} className="space-y-3">
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Sender Agent</label>
                <select
                  value={postAgent}
                  onChange={e => {
                    setPostAgent(e.target.value);
                    setPostName(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1));
                  }}
                  className="w-full px-3 py-2 bg-elevated border border-accent-primary/10 rounded-lg text-text-primary text-sm"
                >
                  {agentNames.map(a => (
                    <option key={a} value={a} className="bg-elevated capitalize">{a}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Message Type</label>
                <select
                  value={postType}
                  onChange={e => setPostType(e.target.value)}
                  className="w-full px-3 py-2 bg-elevated border border-accent-primary/10 rounded-lg text-text-primary text-sm"
                >
                  {MESSAGE_TYPES.map(t => (
                    <option key={t} value={t} className="bg-elevated">{t.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Priority</label>
                <select
                  value={postPriority}
                  onChange={e => setPostPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-elevated border border-accent-primary/10 rounded-lg text-text-primary text-sm"
                >
                  {['low', 'normal', 'high', 'critical'].map(p => (
                    <option key={p} value={p} className="bg-elevated capitalize">{p}</option>
                  ))}
                </select>
              </div>
            </div>
            <input
              type="text"
              value={postSubject}
              onChange={e => setPostSubject(e.target.value)}
              className="w-full px-3 py-2 bg-elevated border border-accent-primary/10 rounded-lg text-text-primary text-sm"
              placeholder="Subject (optional)"
            />
            <textarea
              value={postContent}
              onChange={e => setPostContent(e.target.value)}
              className="w-full px-3 py-2 bg-elevated border border-accent-primary/10 rounded-lg text-text-primary text-sm resize-none"
              rows={3}
              placeholder="Message content"
            />
            <div className="flex gap-2">
              <button type="submit" disabled={posting} className="btn-primary text-sm px-4 py-2 disabled:opacity-50">
                {posting ? 'Sending...' : 'Send'}
              </button>
              <button type="button" onClick={() => setShowPostForm(false)} className="btn-secondary text-sm px-4 py-2">
                Cancel
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-text-muted" />
        <select
          value={filterAgent}
          onChange={e => setFilterAgent(e.target.value)}
          className="px-3 py-1.5 bg-elevated border border-accent-primary/10 rounded-lg text-text-primary text-sm"
        >
          <option value="" className="bg-elevated">All Agents</option>
          {agentNames.map(a => (
            <option key={a} value={a} className="bg-elevated capitalize">{a}</option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-3 py-1.5 bg-elevated border border-accent-primary/10 rounded-lg text-text-primary text-sm"
        >
          <option value="" className="bg-elevated">All Types</option>
          {MESSAGE_TYPES.map(t => (
            <option key={t} value={t} className="bg-elevated">{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <select
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
          className="px-3 py-1.5 bg-elevated border border-accent-primary/10 rounded-lg text-text-primary text-sm"
        >
          <option value="" className="bg-elevated">All Priorities</option>
          {['low', 'normal', 'high', 'critical'].map(p => (
            <option key={p} value={p} className="bg-elevated capitalize">{p}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filteredFeed.map((msg: any) => {
          const agentColor = AGENT_COLORS[msg.sender_agent] || '#999';
          const priorityBorderColors: Record<string, string> = {
            critical: '#ef4444',
            high: '#ffbf00',
            normal: 'transparent',
            low: '#666666',
          };
          const borderColor = priorityBorderColors[msg.priority] || 'transparent';
          return (
            <GlassCard key={msg.id} hover={false} className="!p-4">
              <div className="flex items-start gap-3" style={{ borderLeft: `3px solid ${borderColor}`, paddingLeft: 12 }}>
                <AgentAvatar name={msg.sender_agent} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold" style={{ color: agentColor }}>{msg.sender_name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-elevated text-text-secondary">
                      {msg.message_type.replace(/_/g, ' ')}
                    </span>
                    <PriorityBadge priority={msg.priority} />
                    {msg.target_agent && msg.target_agent !== 'all' && (
                      <span className="text-xs text-text-muted">→ {msg.target_agent}</span>
                    )}
                  </div>
                  {msg.subject && (
                    <h4 className="text-sm font-medium text-text-primary mb-1">{msg.subject}</h4>
                  )}
                  <p className="text-sm text-text-secondary whitespace-pre-wrap">{msg.content}</p>
                  {msg.acknowledged_by && msg.acknowledged_by.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs text-text-muted">Acked by:</span>
                      {msg.acknowledged_by.map((a: string) => (
                        <AgentAvatar key={a} name={a} size="sm" />
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-xs text-text-muted whitespace-nowrap">
                  {new Date(msg.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
