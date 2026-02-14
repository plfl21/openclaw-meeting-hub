import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Calendar, Users } from 'lucide-react';
import { usePolling } from '../hooks/usePolling';
import { api, withFallback } from '../lib/api';
import { seedMeetings } from '../lib/seed-data';
import { MEETING_TYPES } from '../lib/constants';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';

export default function Meetings() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formType, setFormType] = useState('general');
  const [creating, setCreating] = useState(false);

  const fetchMeetings = useCallback(
    () => withFallback(() => api<any[]>('/api/meeting-hub/meetings'), seedMeetings),
    []
  );
  const { data: meetings, refresh } = usePolling(fetchMeetings, 30000);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    setCreating(true);
    try {
      await api('/api/meeting-hub/meetings', {
        method: 'POST',
        body: JSON.stringify({ title: formTitle, description: formDesc, meeting_type: formType }),
      });
      setFormTitle('');
      setFormDesc('');
      setFormType('general');
      setShowForm(false);
      refresh();
    } catch (err) {
      console.error('Failed to create meeting:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-accent-primary">Meetings</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New Meeting
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="glass-card p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-accent-primary">Create Meeting</h2>
              <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-elevated border border-accent-primary/10 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary/40"
                  placeholder="Meeting title"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Description</label>
                <textarea
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  className="w-full px-4 py-2.5 bg-elevated border border-accent-primary/10 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary/40 resize-none"
                  rows={3}
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Type</label>
                <select
                  value={formType}
                  onChange={e => setFormType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-elevated border border-accent-primary/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-primary/40"
                >
                  {MEETING_TYPES.map(t => (
                    <option key={t} value={t} className="bg-elevated">{t}</option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={creating} className="w-full btn-primary py-2.5 disabled:opacity-50">
                {creating ? 'Creating...' : 'Create Meeting'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(meetings || seedMeetings).map((meeting: any) => (
          <GlassCard
            key={meeting.id}
            onClick={() => navigate(`/meetings/${meeting.id}`)}
            className="cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-base font-semibold text-text-primary line-clamp-1">{meeting.title}</h3>
              <StatusBadge status={meeting.status} size="sm" />
            </div>
            {meeting.description && (
              <p className="text-sm text-text-secondary mb-3 line-clamp-2">{meeting.description}</p>
            )}
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="flex items-center gap-1 capitalize">
                <Users className="w-3.5 h-3.5" />
                {meeting.meeting_type}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(meeting.created_at).toLocaleDateString()}
              </span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
