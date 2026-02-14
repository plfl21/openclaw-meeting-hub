import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, User, CreditCard, Server, Key } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getPlanById } from '../lib/stripe';
import GlassCard from '../components/GlassCard';

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [backendUrl, setBackendUrl] = useState(
    import.meta.env.VITE_API_BASE_URL || 'https://marrymegreece.replit.app'
  );
  const [saved, setSaved] = useState(false);

  const currentPlan = getPlanById(user?.plan || 'starter');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ displayName, email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-accent-primary flex items-center gap-2">
        <SettingsIcon className="w-6 h-6" />
        Settings
      </h1>

      <GlassCard hover={false}>
        <h2 className="text-lg font-semibold text-accent-primary mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile
        </h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 bg-elevated border border-accent-primary/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-primary/40"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-elevated border border-accent-primary/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-primary/40"
            />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary text-sm px-6 py-2.5">
              Save Changes
            </button>
            {saved && <span className="text-sm text-success">Saved!</span>}
          </div>
        </form>
      </GlassCard>

      <GlassCard hover={false}>
        <h2 className="text-lg font-semibold text-accent-primary mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Subscription
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-elevated/50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-text-primary">Current Plan</p>
              <p className="text-xs text-text-secondary">
                {currentPlan?.name || 'Starter'} — ${currentPlan?.price || 9}{currentPlan?.period || '/month'}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent-primary/15 text-accent-primary capitalize">
              {user?.plan || 'starter'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span>Meetings: {currentPlan?.limits.meetingsPerMonth || 5}/month</span>
            <span className="text-text-muted">|</span>
            <span>Agents: {currentPlan?.limits.agents === Infinity ? 'Unlimited' : currentPlan?.limits.agents || 3}</span>
          </div>
          <button
            onClick={() => navigate('/pricing')}
            className="btn-secondary text-sm px-4 py-2"
          >
            Upgrade Plan
          </button>
        </div>
      </GlassCard>

      <GlassCard hover={false}>
        <h2 className="text-lg font-semibold text-accent-primary mb-4 flex items-center gap-2">
          <Server className="w-5 h-5" />
          Backend Configuration
        </h2>
        <div>
          <label className="block text-sm text-text-secondary mb-1">API Base URL</label>
          <input
            type="text"
            value={backendUrl}
            onChange={e => setBackendUrl(e.target.value)}
            className="w-full px-4 py-2.5 bg-elevated border border-accent-primary/10 rounded-lg text-text-primary font-mono text-sm focus:outline-none focus:border-accent-primary/40"
          />
          <p className="text-xs text-text-muted mt-1">
            Set via VITE_API_BASE_URL environment variable. Changes require app restart.
          </p>
        </div>
      </GlassCard>

      {user?.plan === 'team' && (
        <GlassCard hover={false}>
          <h2 className="text-lg font-semibold text-accent-primary mb-4 flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Keys
          </h2>
          <div className="p-3 bg-elevated/50 rounded-lg">
            <label className="block text-sm text-text-secondary mb-1">API Key</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-darkest rounded text-accent-secondary font-mono text-sm">
                oc_live_••••••••••••••••••••
              </code>
              <button className="btn-secondary text-xs px-3 py-2">Copy</button>
              <button className="btn-secondary text-xs px-3 py-2">Regenerate</button>
            </div>
            <p className="text-xs text-text-muted mt-2">
              Use this key to access the OpenClaw API from your own applications.
            </p>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
