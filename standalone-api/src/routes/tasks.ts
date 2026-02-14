import { Router, Request, Response } from 'express';
import { query, getMany, getOne } from '../db.js';
import crypto from 'crypto';

const router = Router();
const uuid = () => crypto.randomUUID();

router.post('/assign', async (req: Request, res: Response) => {
  try {
    const { title, description, assigned_to, priority, due_date, meeting_id, created_by } = req.body;
    if (!title || !assigned_to) return res.status(400).json({ error: 'title and assigned_to are required' });

    const id = uuid();
    const task = await getOne(`
      INSERT INTO action_items (id, meeting_id, title, description, assigned_to, priority, due_date, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW(), NOW())
      RETURNING *
    `, [id, meeting_id || null, title, description || null, assigned_to, priority || 'medium', due_date || null]);

    try {
      await query(`
        INSERT INTO neuron_messages (id, sender_agent, sender_name, message_type, subject, body, channel, priority, target_agent, acknowledged, created_at)
        VALUES ($1, $2, $2, 'task_assignment', $3, $4, 'tasks', $5, $6, false, NOW())
      `, [uuid(), created_by || 'system', `Task: ${title}`, description || null, priority || 'normal', assigned_to]);
    } catch {}

    res.status(201).json({ data: task });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:task_id/dependencies', async (req: Request, res: Response) => {
  try {
    const { task_id } = req.params;
    const { depends_on_task_id } = req.body;
    if (!depends_on_task_id) return res.status(400).json({ error: 'depends_on_task_id is required' });

    const id = uuid();
    const dep = await getOne(`
      INSERT INTO task_dependencies (id, task_id, depends_on_task_id, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `, [id, task_id, depends_on_task_id]);

    res.status(201).json({ data: dep });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:task_id/dependencies', async (req: Request, res: Response) => {
  try {
    const { task_id } = req.params;
    const deps = await getMany(`
      SELECT td.*, ai.title as dependency_title, ai.status as dependency_status, ai.assigned_to
      FROM task_dependencies td
      LEFT JOIN action_items ai ON ai.id = td.depends_on_task_id
      WHERE td.task_id = $1
    `, [task_id]);

    res.json({ data: deps });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/agent-workload/:agent_name', async (req: Request, res: Response) => {
  try {
    const { agent_name } = req.params;
    const tasks = await getMany(`
      SELECT * FROM action_items WHERE assigned_to = $1 ORDER BY 
        CASE priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END,
        created_at DESC
    `, [agent_name]);

    const summary = await getOne(`
      SELECT 
        COUNT(*)::text as total,
        COUNT(*) FILTER (WHERE status = 'pending')::text as pending,
        COUNT(*) FILTER (WHERE status = 'in_progress')::text as in_progress,
        COUNT(*) FILTER (WHERE status = 'done')::text as done,
        COUNT(*) FILTER (WHERE status = 'blocked')::text as blocked
      FROM action_items WHERE assigned_to = $1
    `, [agent_name]);

    res.json({ data: { agent: agent_name, summary, tasks } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/check-duplicate', async (req: Request, res: Response) => {
  try {
    const { title, assigned_to } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const existing = await getMany(`
      SELECT id, title, status, assigned_to FROM action_items 
      WHERE LOWER(title) = LOWER($1) AND ($2::text IS NULL OR assigned_to = $2)
      AND status != 'done'
    `, [title, assigned_to || null]);

    res.json({ data: { is_duplicate: existing.length > 0, existing_tasks: existing } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/blocked', async (_req: Request, res: Response) => {
  try {
    const blocked = await getMany(`
      SELECT ai.*, 
        json_agg(json_build_object(
          'depends_on', td.depends_on_task_id, 
          'dep_title', dep.title, 
          'dep_status', dep.status
        )) as blocking_dependencies
      FROM action_items ai
      JOIN task_dependencies td ON td.task_id = ai.id
      JOIN action_items dep ON dep.id = td.depends_on_task_id AND dep.status != 'done'
      WHERE ai.status != 'done'
      GROUP BY ai.id
    `);
    res.json({ data: blocked });
  } catch (err: any) {
    try {
      const simple = await getMany(`SELECT * FROM action_items WHERE status = 'blocked' ORDER BY created_at DESC`);
      res.json({ data: simple });
    } catch {
      res.status(500).json({ error: err.message });
    }
  }
});

export default router;
