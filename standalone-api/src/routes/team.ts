import { Router, Request, Response } from 'express';
import { query, getMany, getOne } from '../db.js';
import crypto from 'crypto';

const router = Router();
const uuid = () => crypto.randomUUID();

router.get('/team', async (_req: Request, res: Response) => {
  try {
    const team = [
      { name: 'petro', display_name: 'Petro', role: 'Owner', color: '#10b981', status: 'active', domain: 'Strategic decisions, approvals, business direction' },
      { name: 'johnny', display_name: 'Johnny', role: 'Sales Expert', color: '#ffbf00', status: 'active', domain: 'Sales logic, leads, CIA profiles, customer engagement' },
      { name: 'claude', display_name: 'Claude', role: 'Local Admin', color: '#00ffd5', status: 'active', domain: 'System administration, VPS commands, file operations' },
      { name: 'replit', display_name: 'Replit', role: 'Tech Wizard', color: '#a78bfa', status: 'active', domain: 'Code, infrastructure, APIs, deployment' },
      { name: 'lovable', display_name: 'Lovable', role: 'UI/UX Wizard', color: '#ec4899', status: 'active', domain: 'Frontend design, dashboards, user experience' },
    ];

    for (const member of team) {
      try {
        const stats = await getOne(`
          SELECT COUNT(*)::int as total_tasks,
            COUNT(*) FILTER (WHERE status = 'pending')::int as pending,
            COUNT(*) FILTER (WHERE status = 'in_progress')::int as in_progress
          FROM action_items WHERE assigned_to = $1
        `, [member.name]);
        (member as any).tasks = stats || { total_tasks: 0, pending: 0, in_progress: 0 };
      } catch {
        (member as any).tasks = { total_tasks: 0, pending: 0, in_progress: 0 };
      }
    }

    res.json({ data: team });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/agent-tasks/:agent_name', async (req: Request, res: Response) => {
  try {
    const { agent_name } = req.params;
    const tasks = await getMany(`
      SELECT * FROM action_items WHERE assigned_to = $1 ORDER BY 
        CASE status WHEN 'in_progress' THEN 0 WHEN 'pending' THEN 1 WHEN 'blocked' THEN 2 WHEN 'done' THEN 3 END,
        CASE priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END,
        created_at DESC
    `, [agent_name]);
    res.json({ data: tasks });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/timeline', async (req: Request, res: Response) => {
  try {
    const { limit, since, entity_type } = req.query;
    let where = 'WHERE 1=1';
    const params: any[] = [];
    let i = 1;

    if (since) { where += ` AND created_at > $${i++}`; params.push(since); }
    if (entity_type) { where += ` AND entity_type = $${i++}`; params.push(entity_type); }

    const lim = Math.min(parseInt(limit as string) || 50, 200);
    params.push(lim);

    const entries = await getMany(`
      SELECT * FROM timeline_entries ${where} ORDER BY created_at DESC LIMIT $${i}
    `, params);

    res.json({ data: entries });
  } catch (err: any) {
    try {
      const entries = await getMany(`
        SELECT id, action as event_type, entity_type, entity_id, agent_name, details as metadata, created_at
        FROM audit_log ORDER BY created_at DESC LIMIT 50
      `);
      res.json({ data: entries });
    } catch {
      res.status(500).json({ error: err.message });
    }
  }
});

router.post('/audit', async (req: Request, res: Response) => {
  try {
    const { action, entity_type, entity_id, agent_name, details } = req.body;
    if (!action || !entity_type) return res.status(400).json({ error: 'action and entity_type are required' });

    const id = uuid();
    const entry = await getOne(`
      INSERT INTO audit_log (id, action, entity_type, entity_id, agent_name, details, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `, [id, action, entity_type, entity_id || null, agent_name || 'system', details ? JSON.stringify(details) : null]);

    res.status(201).json({ data: entry });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/audit/:meeting_id', async (req: Request, res: Response) => {
  try {
    const { meeting_id } = req.params;
    const entries = await getMany(`
      SELECT * FROM audit_log WHERE entity_id = $1 ORDER BY created_at DESC
    `, [meeting_id]);
    res.json({ data: entries });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/folders', async (_req: Request, res: Response) => {
  try {
    const folders = await getMany(`
      SELECT f.*,
        (SELECT COUNT(*) FROM meetings m WHERE m.folder_id = f.id) as meeting_count
      FROM meeting_folders f ORDER BY f.name
    `);
    res.json({ data: folders });
  } catch (err: any) {
    res.json({ data: [] });
  }
});

router.post('/folders', async (req: Request, res: Response) => {
  try {
    const { name, description, color } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const id = uuid();
    const folder = await getOne(`
      INSERT INTO meeting_folders (id, name, description, color, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `, [id, name, description || null, color || '#ffbf00']);

    res.status(201).json({ data: folder });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
