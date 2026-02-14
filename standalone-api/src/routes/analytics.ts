import { Router, Request, Response } from 'express';
import { getMany, getOne } from '../db.js';

const router = Router();

router.get('/overview', async (_req: Request, res: Response) => {
  try {
    const meetings = await getOne(`
      SELECT COUNT(*)::text as total,
        COUNT(*) FILTER (WHERE status = 'in_progress')::text as active,
        COUNT(*) FILTER (WHERE status = 'completed')::text as completed,
        COUNT(*) FILTER (WHERE status = 'draft')::text as draft
      FROM meetings
    `) || { total: '0', active: '0', completed: '0', draft: '0' };

    let turns = '0', decisions = '0', actionItems = '0', proposals = '0', jobs = '0';
    try { turns = (await getOne('SELECT COUNT(*)::text as c FROM meeting_turns'))?.c || '0'; } catch {}
    try { decisions = (await getOne('SELECT COUNT(*)::text as c FROM decisions'))?.c || '0'; } catch {}
    try { actionItems = (await getOne('SELECT COUNT(*)::text as c FROM action_items'))?.c || '0'; } catch {}
    try { proposals = (await getOne('SELECT COUNT(*)::text as c FROM proposals'))?.c || '0'; } catch {}
    try { jobs = (await getOne('SELECT COUNT(*)::text as c FROM job_executions'))?.c || '0'; } catch {}

    res.json({
      data: {
        meetings,
        turns: { total: turns },
        decisions: { total: decisions },
        action_items: { total: actionItems },
        proposals: { total: proposals },
        job_executions: { total: jobs },
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/activity-timeline', async (_req: Request, res: Response) => {
  try {
    const timeline = await getMany(`
      SELECT d.day::text, 
        COALESCE(m.meetings_created, 0) as meetings_created,
        COALESCE(t.turns_added, 0) as turns_added,
        COALESCE(d2.decisions_made, 0) as decisions_made,
        COALESCE(n.neuron_messages, 0) as neuron_messages
      FROM generate_series(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, '1 day') as d(day)
      LEFT JOIN (SELECT DATE(created_at) as day, COUNT(*) as meetings_created FROM meetings GROUP BY 1) m ON m.day = d.day
      LEFT JOIN (SELECT DATE(created_at) as day, COUNT(*) as turns_added FROM meeting_turns GROUP BY 1) t ON t.day = d.day
      LEFT JOIN (SELECT DATE(created_at) as day, COUNT(*) as decisions_made FROM decisions GROUP BY 1) d2 ON d2.day = d.day
      LEFT JOIN (SELECT DATE(created_at) as day, COUNT(*) as neuron_messages FROM neuron_messages GROUP BY 1) n ON n.day = d.day
      ORDER BY d.day ASC
    `);
    res.json({ data: timeline });
  } catch (err: any) {
    try {
      const simple = await getMany(`
        SELECT DATE(created_at)::text as day, COUNT(*) as count 
        FROM meetings WHERE created_at > NOW() - INTERVAL '30 days' 
        GROUP BY 1 ORDER BY 1
      `);
      res.json({ data: simple });
    } catch {
      res.status(500).json({ error: err.message });
    }
  }
});

router.get('/agent-workload', async (_req: Request, res: Response) => {
  try {
    const workload = await getMany(`
      SELECT assigned_to as agent, COUNT(*)::text as total,
        COUNT(*) FILTER (WHERE status = 'done')::text as done,
        COUNT(*) FILTER (WHERE status = 'pending')::text as pending,
        COUNT(*) FILTER (WHERE status = 'in_progress')::text as in_progress
      FROM action_items GROUP BY assigned_to ORDER BY total DESC
    `);
    res.json({ data: workload });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/turn-types', async (_req: Request, res: Response) => {
  try {
    const turnTypes = await getMany(`
      SELECT turn_type as type, COUNT(*)::text as count
      FROM meeting_turns GROUP BY turn_type ORDER BY count DESC
    `);
    res.json({ data: turnTypes });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/job-executions', async (_req: Request, res: Response) => {
  try {
    const jobs = await getMany(`
      SELECT id, workflow_id, workflow_name, run_id, status, trigger_type, started_at, completed_at, duration_ms, steps_completed, steps_total, error_message
      FROM job_executions ORDER BY started_at DESC LIMIT 50
    `);
    res.json({ data: jobs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/decision-outcomes', async (_req: Request, res: Response) => {
  try {
    const outcomes = await getMany(`
      SELECT status, COUNT(*)::text as count
      FROM decisions GROUP BY status ORDER BY count DESC
    `);
    res.json({ data: outcomes });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/recent-audit', async (_req: Request, res: Response) => {
  try {
    const audit = await getMany(`
      SELECT id, action, entity_type, entity_id, agent_name, details, created_at
      FROM audit_log ORDER BY created_at DESC LIMIT 30
    `);
    res.json({ data: audit });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
