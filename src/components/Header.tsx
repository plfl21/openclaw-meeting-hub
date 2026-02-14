import React from 'react';
import { Menu } from 'lucide-react';
import ConnectionStatus from './ConnectionStatus';
import { useAuth } from '../hooks/useAuth';
import AgentAvatar from './AgentAvatar';

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 glass-overlay border-b border-accent-primary/10 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-elevated text-text-secondary"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-accent-primary hidden sm:block">
            Meeting Hub
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <ConnectionStatus />
          {user && (
            <div className="flex items-center gap-2">
              <AgentAvatar name={user.displayName} size="sm" />
              <span className="text-sm text-text-secondary hidden sm:block">{user.displayName}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent-primary/15 text-accent-primary capitalize">
                {user.plan}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
