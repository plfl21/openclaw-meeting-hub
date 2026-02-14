import { Router, Request, Response } from 'express';
import { query, getMany, getOne } from '../db.js';
import crypto from 'crypto';

const router = Router();
const uuid = () => crypto.randomUUID();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const meetings = await getMany(`
      SELECT m.*, 
        (SELECT COUNT(*) FROM meeting_participants mp WHERE mp.meeting_id = m.id) as participant_count,
        (SELECT COUNT(*) FROM meeting_turns mt WHERE mt.meeting_id = m.id) as turn_count,
        (SELECT COUNT(*) FROM decisions d WHERE d.meeting_id = m.id) as decision_count,
        (SELECT COUNT(*) FROM action_items ai WHERE ai.meeting_id = m.id) as action_item_count
      FROM meetings m ORDER BY m.created_at DESC
    `);
    res.json({ data: meetings });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, meeting_type, scheduled_for, created_by, folder_id } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const id = uuid();
    const meeting = await getOne(`
      INSERT INTO meetings (id, title, description, meeting_type, status, scheduled_for, created_by, folder_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, 'draft', $5, $6, $7, NOW(), NOW())
      RETURNING *
    `, [id, title, description || null, meeting_type || 'general', scheduled_for || null, created_by || 'system', folder_id || null]);

    res.status(201).json({ data: meeting });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const meeting = await getOne('SELECT * FROM meetings WHERE id = $1', [id]);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    const participants = await getMany('SELECT * FROM meeting_participants WHERE meeting_id = $1 ORDER BY joined_at', [id]);
    const agenda = await getMany('SELECT * FROM meeting_agenda WHERE meeting_id = $1 ORDER BY sort_order', [id]);
    const turns = await getMany('SELECT * FROM meeting_turns WHERE meeting_id = $1 ORDER BY created_at', [id]);
    const decisions = await getMany('SELECT * FROM decisions WHERE meeting_id = $1 ORDER BY created_at', [id]);
    const actionItems = await getMany('SELECT * FROM action_items WHERE meeting_id = $1 ORDER BY created_at', [id]);

    for (const d of decisions) {
      try {
        d.votes = await getMany('SELECT * FROM decision_votes WHERE decision_id = $1', [d.id]);
      } catch { d.votes = []; }
    }

    res.json({ data: { ...meeting, participants, agenda, turns, decisions, action_items: actionItems } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const allowed = ['title', 'description', 'meeting_type', 'status', 'scheduled_for', 'folder_id'];
    const sets: string[] = [];
    const vals: any[] = [];
    let i = 1;

    for (const [k, v] of Object.entries(fields)) {
      if (allowed.includes(k)) {
        sets.push(`${k} = $${i}`);
        vals.push(v);
        i++;
      }
    }

    if (sets.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

    sets.push(`updated_at = NOW()`);
    vals.push(id);

    const meeting = await getOne(`UPDATE meetings SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    res.json({ data: meeting });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/start', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const meeting = await getOne(
      `UPDATE meetings SET status = 'in_progress', started_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json({ data: meeting });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/end', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const meeting = await getOne(
      `UPDATE meetings SET status = 'completed', ended_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json({ data: meeting });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/participants', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { agent_name, display_name, role } = req.body;
    if (!agent_name) return res.status(400).json({ error: 'agent_name is required' });

    const pid = uuid();
    const participant = await getOne(`
      INSERT INTO meeting_participants (id, meeting_id, agent_name, display_name, role, joined_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `, [pid, id, agent_name, display_name || agent_name, role || 'participant']);

    res.status(201).json({ data: participant });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/participants/:pid', async (req: Request, res: Response) => {
  try {
    const { pid } = req.params;
    await query('DELETE FROM meeting_participants WHERE id = $1', [pid]);
    res.json({ data: { deleted: true } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/agenda', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, duration_minutes, sort_order } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const aid = uuid();
    const maxOrder = await getOne('SELECT COALESCE(MAX(sort_order), 0) + 1 as next FROM meeting_agenda WHERE meeting_id = $1', [id]);

    const item = await getOne(`
      INSERT INTO meeting_agenda (id, meeting_id, title, description, duration_minutes, sort_order, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
      RETURNING *
    `, [aid, id, title, description || null, duration_minutes || null, sort_order ?? maxOrder?.next ?? 1]);

    res.status(201).json({ data: item });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/agenda/:aid', async (req: Request, res: Response) => {
  try {
    const { aid } = req.params;
    const { title, description, duration_minutes, sort_order, status } = req.body;
    const sets: string[] = [];
    const vals: any[] = [];
    let i = 1;

    if (title !== undefined) { sets.push(`title = $${i++}`); vals.push(title); }
    if (description !== undefined) { sets.push(`description = $${i++}`); vals.push(description); }
    if (duration_minutes !== undefined) { sets.push(`duration_minutes = $${i++}`); vals.push(duration_minutes); }
    if (sort_order !== undefined) { sets.push(`sort_order = $${i++}`); vals.push(sort_order); }
    if (status !== undefined) { sets.push(`status = $${i++}`); vals.push(status); }

    if (sets.length === 0) return res.status(400).json({ error: 'No fields to update' });

    vals.push(aid);
    const item = await getOne(`UPDATE meeting_agenda SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ data: item });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/turns', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const turns = await getMany('SELECT * FROM meeting_turns WHERE meeting_id = $1 ORDER BY created_at ASC', [id]);
    res.json({ data: turns });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/turns', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { agent_name, display_name, turn_type, content, metadata } = req.body;
    if (!agent_name || !content) return res.status(400).json({ error: 'agent_name and content are required' });

    const tid = uuid();
    const turn = await getOne(`
      INSERT INTO meeting_turns (id, meeting_id, agent_name, display_name, turn_type, content, metadata, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `, [tid, id, agent_name, display_name || agent_name, turn_type || 'comment', content, metadata ? JSON.stringify(metadata) : null]);

    res.status(201).json({ data: turn });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/decisions', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, proposed_by, decision_type, options } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const did = uuid();
    const decision = await getOne(`
      INSERT INTO decisions (id, meeting_id, title, description, proposed_by, decision_type, options, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'proposed', NOW(), NOW())
      RETURNING *
    `, [did, id, title, description || null, proposed_by || 'system', decision_type || 'majority', options ? JSON.stringify(options) : null]);

    res.status(201).json({ data: decision });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/decisions/:did/vote', async (req: Request, res: Response) => {
  try {
    const { did } = req.params;
    const { agent_name, vote, reasoning } = req.body;
    if (!agent_name || !vote) return res.status(400).json({ error: 'agent_name and vote are required' });

    const vid = uuid();
    await query('DELETE FROM decision_votes WHERE decision_id = $1 AND agent_name = $2', [did, agent_name]);

    const v = await getOne(`
      INSERT INTO decision_votes (id, decision_id, agent_name, vote, reasoning, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `, [vid, did, agent_name, vote, reasoning || null]);

    res.status(201).json({ data: v });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/decisions/:did', async (req: Request, res: Response) => {
  try {
    const { did } = req.params;
    const { status, outcome, resolved_by } = req.body;
    const sets: string[] = ['updated_at = NOW()'];
    const vals: any[] = [];
    let i = 1;

    if (status) { sets.push(`status = $${i++}`); vals.push(status); }
    if (outcome) { sets.push(`outcome = $${i++}`); vals.push(outcome); }
    if (resolved_by) { sets.push(`resolved_by = $${i++}`); vals.push(resolved_by); }
    if (status === 'resolved') { sets.push(`resolved_at = NOW()`); }

    vals.push(did);
    const decision = await getOne(`UPDATE decisions SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ data: decision });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/action-items', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, assigned_to, priority, due_date, decision_id } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const aid = uuid();
    const item = await getOne(`
      INSERT INTO action_items (id, meeting_id, title, description, assigned_to, priority, due_date, decision_id, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', NOW(), NOW())
      RETURNING *
    `, [aid, id, title, description || null, assigned_to || null, priority || 'medium', due_date || null, decision_id || null]);

    res.status(201).json({ data: item });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/action-items/:aid', async (req: Request, res: Response) => {
  try {
    const { aid } = req.params;
    const fields = req.body;
    const allowed = ['title', 'description', 'assigned_to', 'priority', 'due_date', 'status', 'completed_at'];
    const sets: string[] = ['updated_at = NOW()'];
    const vals: any[] = [];
    let i = 1;

    for (const [k, v] of Object.entries(fields)) {
      if (allowed.includes(k)) {
        sets.push(`${k} = $${i++}`);
        vals.push(v);
      }
    }

    if (fields.status === 'done' && !fields.completed_at) {
      sets.push(`completed_at = NOW()`);
    }

    vals.push(aid);
    const item = await getOne(`UPDATE action_items SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ data: item });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
