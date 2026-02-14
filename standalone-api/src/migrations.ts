import { query } from './db.js';

export async function runMigrations() {
  console.log('Running database migrations...');

  const statements = [
    `CREATE TABLE IF NOT EXISTS meetings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      meeting_type TEXT DEFAULT 'general',
      status TEXT DEFAULT 'draft',
      scheduled_for TIMESTAMPTZ,
      started_at TIMESTAMPTZ,
      ended_at TIMESTAMPTZ,
      created_by TEXT DEFAULT 'system',
      folder_id UUID,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS meeting_participants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
      agent_name TEXT NOT NULL,
      display_name TEXT,
      role TEXT DEFAULT 'participant',
      joined_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS meeting_agenda (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      duration_minutes INT,
      sort_order INT DEFAULT 0,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS meeting_turns (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
      agent_name TEXT NOT NULL,
      display_name TEXT,
      turn_type TEXT DEFAULT 'comment',
      content TEXT NOT NULL,
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS decisions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      proposed_by TEXT DEFAULT 'system',
      decision_type TEXT DEFAULT 'majority',
      options JSONB,
      status TEXT DEFAULT 'proposed',
      outcome TEXT,
      resolved_by TEXT,
      resolved_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS decision_votes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE,
      agent_name TEXT NOT NULL,
      vote TEXT NOT NULL,
      reasoning TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS action_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      meeting_id UUID,
      title TEXT NOT NULL,
      description TEXT,
      assigned_to TEXT,
      priority TEXT DEFAULT 'medium',
      due_date TIMESTAMPTZ,
      decision_id UUID,
      status TEXT DEFAULT 'pending',
      completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS task_dependencies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      task_id UUID REFERENCES action_items(id) ON DELETE CASCADE,
      depends_on_task_id UUID REFERENCES action_items(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS neuron_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sender_agent TEXT NOT NULL,
      sender_name TEXT,
      message_type TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT,
      channel TEXT DEFAULT 'general',
      priority TEXT DEFAULT 'normal',
      target_agent TEXT DEFAULT 'all',
      metadata JSONB,
      acknowledged BOOLEAN DEFAULT false,
      acknowledged_by TEXT,
      acknowledged_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS proposals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      meeting_id UUID,
      created_by TEXT DEFAULT 'system',
      status TEXT DEFAULT 'draft',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS proposal_boxes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT,
      box_type TEXT DEFAULT 'idea',
      position_x FLOAT DEFAULT 0,
      position_y FLOAT DEFAULT 0,
      width FLOAT DEFAULT 200,
      height FLOAT DEFAULT 100,
      color TEXT DEFAULT '#ffbf00',
      agent_name TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS proposal_connections (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
      from_box_id UUID REFERENCES proposal_boxes(id) ON DELETE CASCADE,
      to_box_id UUID REFERENCES proposal_boxes(id) ON DELETE CASCADE,
      label TEXT,
      connection_type TEXT DEFAULT 'arrow',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS job_executions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workflow_id TEXT,
      workflow_name TEXT,
      run_id TEXT,
      status TEXT DEFAULT 'running',
      trigger_type TEXT DEFAULT 'manual',
      started_at TIMESTAMPTZ DEFAULT NOW(),
      completed_at TIMESTAMPTZ,
      duration_ms INT,
      steps_completed INT DEFAULT 0,
      steps_total INT DEFAULT 0,
      error_message TEXT
    )`,

    `CREATE TABLE IF NOT EXISTS audit_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      agent_name TEXT DEFAULT 'system',
      details JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS timeline_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_type TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      agent_name TEXT,
      title TEXT,
      description TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS meeting_folders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#ffbf00',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    `CREATE INDEX IF NOT EXISTS idx_meeting_turns_meeting ON meeting_turns(meeting_id)`,
    `CREATE INDEX IF NOT EXISTS idx_decisions_meeting ON decisions(meeting_id)`,
    `CREATE INDEX IF NOT EXISTS idx_action_items_meeting ON action_items(meeting_id)`,
    `CREATE INDEX IF NOT EXISTS idx_action_items_assigned ON action_items(assigned_to)`,
    `CREATE INDEX IF NOT EXISTS idx_neuron_messages_agent ON neuron_messages(target_agent)`,
    `CREATE INDEX IF NOT EXISTS idx_neuron_messages_type ON neuron_messages(message_type)`,
    `CREATE INDEX IF NOT EXISTS idx_neuron_messages_created ON neuron_messages(created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_proposals_meeting ON proposals(meeting_id)`,
  ];

  for (const sql of statements) {
    try {
      await query(sql);
    } catch (err: any) {
      console.warn(`Migration warning: ${err.message.slice(0, 100)}`);
    }
  }

  console.log('Migrations complete.');
}
