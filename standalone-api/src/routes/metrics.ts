import { Router, Request, Response } from 'express';
import { query, getMany, getOne } from '../db.js';

const router = Router();

router.get('/server', async (_req: Request, res: Response) => {
  try {
    const uptime = process.uptime();
    const mem = process.memoryUsage();
    const cpu = process.cpuUsage();

    let dbInfo: any = { connected: false };
    try {
      const dbResult = await getOne('SELECT NOW() as server_time, version() as pg_version');
      dbInfo = { connected: true, server_time: dbResult.server_time, pg_version: dbResult.pg_version.split(' ').slice(0, 2).join(' ') };
    } catch { dbInfo = { connected: false }; }

    const tables = ['meetings', 'meeting_turns', 'action_items', 'decisions', 'neuron_messages', 'proposals', 'job_executions', 'audit_log', 'timeline_entries'];
    const tableCounts: Record<string, string> = {};
    for (const t of tables) {
      try {
        const r = await getOne(`SELECT COUNT(*)::text as c FROM ${t}`);
        tableCounts[`${t}_count`] = r?.c || '0';
      } catch { tableCounts[`${t}_count`] = '0'; }
    }

    const hours = Math.floor(uptime / 3600);
    const mins = Math.floor((uptime % 3600) / 60);
    const secs = Math.floor(uptime % 60);

    res.json({
      data: {
        status: 'healthy',
        uptime_seconds: Math.floor(uptime),
        uptime_formatted: `${hours}h ${mins}m ${secs}s`,
        memory: {
          rss_mb: Math.round(mem.rss / 1048576),
          heap_used_mb: Math.round(mem.heapUsed / 1048576),
          heap_total_mb: Math.round(mem.heapTotal / 1048576),
          external_mb: Math.round(mem.external / 1048576),
        },
        cpu: { user_ms: Math.round(cpu.user / 1000), system_ms: Math.round(cpu.system / 1000) },
        database: dbInfo,
        table_counts: tableCounts,
        node_version: process.version,
        platform: process.platform,
        env: process.env.NODE_ENV || 'development',
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/workflows', async (_req: Request, res: Response) => {
  try {
    const summary = await getOne(`
      SELECT 
        COUNT(*)::text as total,
        COUNT(*) FILTER (WHERE status = 'completed')::text as completed,
        COUNT(*) FILTER (WHERE status = 'failed')::text as failed,
        COUNT(*) FILTER (WHERE status = 'running')::text as running,
        COALESCE(AVG(duration_ms)::int::text, '0') as avg_duration_ms,
        COALESCE(MAX(duration_ms)::text, '0') as max_duration_ms,
        COALESCE(MIN(duration_ms)::text, '0') as min_duration_ms
      FROM job_executions
    `);

    const total = parseInt(summary?.total || '0');
    const completed = parseInt(summary?.completed || '0');
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const avgMs = parseInt(summary?.avg_duration_ms || '0');

    const byStatus = await getMany(`SELECT status, COUNT(*)::text as count FROM job_executions GROUP BY status ORDER BY count DESC`);
    const recent = await getMany(`
      SELECT id, workflow_id, workflow_name, run_id, status, trigger_type, started_at, completed_at, duration_ms, steps_completed, steps_total, error_message
      FROM job_executions ORDER BY started_at DESC LIMIT 20
    `);

    res.json({
      data: {
        summary: { ...summary, success_rate_pct: successRate, avg_duration_formatted: `${Math.round(avgMs / 1000)}s` },
        by_status: byStatus,
        recent_executions: recent,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/agents', async (_req: Request, res: Response) => {
  try {
    const roster = [
      { name: 'claude', role: 'Local Admin', domain: 'System administration, VPS commands, file operations' },
      { name: 'johnny', role: 'Sales Expert', domain: 'Sales logic, leads, CIA profiles, customer engagement' },
      { name: 'replit', role: 'Tech Wizard', domain: 'Code, infrastructure, APIs, deployment' },
      { name: 'lovable', role: 'UI/UX Wizard', domain: 'Frontend design, dashboards, user experience' },
      { name: 'petro', role: 'Owner', domain: 'Strategic decisions, approvals, business direction' },
    ];

    let taskWorkload: any[] = [];
    try {
      taskWorkload = await getMany(`
        SELECT assigned_to as agent, COUNT(*)::text as total_tasks,
          COUNT(*) FILTER (WHERE status = 'done')::text as done,
          COUNT(*) FILTER (WHERE status = 'pending')::text as pending,
          COUNT(*) FILTER (WHERE status = 'in_progress')::text as in_progress
        FROM action_items GROUP BY assigned_to
      `);
    } catch {}

    let neuronActivity: any[] = [];
    try {
      neuronActivity = await getMany(`
        SELECT sender_agent, COUNT(*)::text as message_count,
          COUNT(DISTINCT message_type)::text as type_variety,
          MAX(created_at) as last_active
        FROM neuron_messages WHERE created_at > NOW() - INTERVAL '7 days'
        GROUP BY sender_agent ORDER BY message_count DESC
      `);
    } catch {}

    let recentMessages: any[] = [];
    try {
      recentMessages = await getMany(`
        SELECT id, sender_agent, sender_name, message_type, subject, priority, target_agent, created_at
        FROM neuron_messages ORDER BY created_at DESC LIMIT 10
      `);
    } catch {}

    res.json({ data: { roster, task_workload: taskWorkload, neuron_activity: neuronActivity, recent_neuron_messages: recentMessages } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/database', async (_req: Request, res: Response) => {
  try {
    const sizeResult = await getOne(`SELECT pg_database_size(current_database()) as bytes`);
    const bytes = parseInt(sizeResult?.bytes || '0');

    const tables = await getMany(`
      SELECT schemaname || '.' || relname as table_name, n_live_tup::int as row_count, n_dead_tup::int as dead_rows
      FROM pg_stat_user_tables ORDER BY n_live_tup DESC
    `);

    let recentActivity: any[] = [];
    try {
      recentActivity = await getMany(`
        SELECT DATE(created_at) as day, COUNT(*)::text as events
        FROM audit_log WHERE created_at > NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at) ORDER BY day DESC
      `);
    } catch {}

    res.json({
      data: {
        database_size: { bytes, mb: Math.round(bytes / 1048576 * 100) / 100, formatted: `${(bytes / 1048576).toFixed(2)} MB` },
        tables,
        recent_activity_by_day: recentActivity,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
