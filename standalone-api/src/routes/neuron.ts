import { Router, Request, Response } from 'express';
import { query, getMany, getOne } from '../db.js';
import crypto from 'crypto';

const router = Router();
const uuid = () => crypto.randomUUID();

router.post('/post', async (req: Request, res: Response) => {
  try {
    const { sender_agent, sender_name, message_type, subject, body, channel, priority, target_agent, metadata } = req.body;
    if (!sender_agent || !message_type || !subject) {
      return res.status(400).json({ error: 'sender_agent, message_type, and subject are required' });
    }

    const validTypes = ['status_update', 'task_assignment', 'task_completion', 'conflict_flag', 'briefing', 'question', 'response', 'announcement', 'diagnostic', 'handoff'];
    if (!validTypes.includes(message_type)) {
      return res.status(400).json({ error: `Invalid message_type. Must be one of: ${validTypes.join(', ')}` });
    }

    const id = uuid();
    const msg = await getOne(`
      INSERT INTO neuron_messages (id, sender_agent, sender_name, message_type, subject, body, channel, priority, target_agent, metadata, acknowledged, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false, NOW())
      RETURNING *
    `, [id, sender_agent, sender_name || sender_agent, message_type, subject, body || null, channel || 'general', priority || 'normal', target_agent || 'all', metadata ? JSON.stringify(metadata) : null]);

    res.status(201).json({ data: msg });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/feed', async (req: Request, res: Response) => {
  try {
    const { channel, limit, since, agent, type } = req.query;
    let where = 'WHERE 1=1';
    const params: any[] = [];
    let i = 1;

    if (channel) { where += ` AND channel = $${i++}`; params.push(channel); }
    if (agent) { where += ` AND (sender_agent = $${i} OR target_agent = $${i} OR target_agent = 'all')`; params.push(agent); i++; }
    if (type) { where += ` AND message_type = $${i++}`; params.push(type); }
    if (since) { where += ` AND created_at > $${i++}`; params.push(since); }

    const lim = Math.min(parseInt(limit as string) || 50, 200);
    params.push(lim);

    const messages = await getMany(`
      SELECT * FROM neuron_messages ${where} ORDER BY created_at DESC LIMIT $${i}
    `, params);

    res.json({ data: messages });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/agent-queue/:agent_name', async (req: Request, res: Response) => {
  try {
    const { agent_name } = req.params;
    const messages = await getMany(`
      SELECT * FROM neuron_messages 
      WHERE (target_agent = $1 OR target_agent = 'all') AND acknowledged = false
      ORDER BY 
        CASE priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 WHEN 'low' THEN 3 END,
        created_at DESC
    `, [agent_name]);

    res.json({ data: messages });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/acknowledge', async (req: Request, res: Response) => {
  try {
    const { message_id, agent_name } = req.body;
    if (!message_id) return res.status(400).json({ error: 'message_id is required' });

    const msg = await getOne(
      'UPDATE neuron_messages SET acknowledged = true, acknowledged_by = $2, acknowledged_at = NOW() WHERE id = $1 RETURNING *',
      [message_id, agent_name || 'unknown']
    );

    if (!msg) return res.status(404).json({ error: 'Message not found' });
    res.json({ data: msg });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/status', async (_req: Request, res: Response) => {
  try {
    const stats = await getOne(`
      SELECT 
        COUNT(*)::text as total_messages,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours')::text as last_24h,
        COUNT(*) FILTER (WHERE acknowledged = false)::text as unacknowledged,
        COUNT(DISTINCT sender_agent)::text as active_agents,
        COUNT(DISTINCT channel)::text as active_channels
      FROM neuron_messages
    `);

    const byType = await getMany(`
      SELECT message_type, COUNT(*)::text as count 
      FROM neuron_messages WHERE created_at > NOW() - INTERVAL '24 hours'
      GROUP BY message_type ORDER BY count DESC
    `);

    const byAgent = await getMany(`
      SELECT sender_agent, COUNT(*)::text as count
      FROM neuron_messages WHERE created_at > NOW() - INTERVAL '24 hours'
      GROUP BY sender_agent ORDER BY count DESC
    `);

    res.json({ data: { ...stats, by_type: byType, by_agent: byAgent } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/briefing', async (req: Request, res: Response) => {
  try {
    const { sender_agent, sender_name, subject, sections, channel, priority, target_agent } = req.body;
    if (!sender_agent || !subject || !sections) {
      return res.status(400).json({ error: 'sender_agent, subject, and sections are required' });
    }

    const body = (sections as Array<{ heading: string; content: string }>)
      .map(s => `## ${s.heading}\n${s.content}`)
      .join('\n\n');

    const id = uuid();
    const msg = await getOne(`
      INSERT INTO neuron_messages (id, sender_agent, sender_name, message_type, subject, body, channel, priority, target_agent, metadata, acknowledged, created_at)
      VALUES ($1, $2, $3, 'briefing', $4, $5, $6, $7, $8, $9, false, NOW())
      RETURNING *
    `, [id, sender_agent, sender_name || sender_agent, subject, body, channel || 'briefings', priority || 'normal', target_agent || 'all', JSON.stringify({ sections })]);

    res.status(201).json({ data: msg });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/conflicts', async (_req: Request, res: Response) => {
  try {
    const conflicts = await getMany(`
      SELECT * FROM neuron_messages 
      WHERE message_type = 'conflict_flag' AND acknowledged = false AND created_at > NOW() - INTERVAL '72 hours'
      ORDER BY created_at DESC
    `);
    res.json({ data: conflicts });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/handoff', async (req: Request, res: Response) => {
  try {
    const { from_agent, to_agent, subject, body, task_context, priority } = req.body;
    if (!from_agent || !to_agent || !subject) {
      return res.status(400).json({ error: 'from_agent, to_agent, and subject are required' });
    }

    const handoffId = uuid();
    const handoff = await getOne(`
      INSERT INTO neuron_messages (id, sender_agent, sender_name, message_type, subject, body, channel, priority, target_agent, metadata, acknowledged, created_at)
      VALUES ($1, $2, $2, 'handoff', $3, $4, 'handoffs', $5, $6, $7, false, NOW())
      RETURNING *
    `, [handoffId, from_agent, subject, body || null, priority || 'high', to_agent, JSON.stringify({ task_context })]);

    const taskId = uuid();
    await getOne(`
      INSERT INTO neuron_messages (id, sender_agent, sender_name, message_type, subject, body, channel, priority, target_agent, metadata, acknowledged, created_at)
      VALUES ($1, $2, $2, 'task_assignment', $3, $4, 'tasks', $5, $6, $7, false, NOW())
    `, [taskId, from_agent, `[Handoff] ${subject}`, body || null, priority || 'high', to_agent, JSON.stringify({ handoff_from: from_agent, task_context })]);

    res.status(201).json({ data: { handoff_message: handoff, task_assignment_id: taskId } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/validate-report', async (req: Request, res: Response) => {
  try {
    const { sections, required_sections } = req.body;
    if (!sections) return res.status(400).json({ error: 'sections is required' });

    const defaults = required_sections || ['summary', 'findings', 'recommendations', 'next_steps'];
    const provided = (sections as any[]).map(s => s.heading?.toLowerCase());
    const missing = defaults.filter((r: string) => !provided.includes(r.toLowerCase()));

    res.json({
      data: {
        valid: missing.length === 0,
        provided_sections: provided,
        required_sections: defaults,
        missing_sections: missing,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/check-conflict', async (req: Request, res: Response) => {
  try {
    const { resource_type, resource_id, requesting_agent } = req.body;
    if (!resource_type || !resource_id) {
      return res.status(400).json({ error: 'resource_type and resource_id are required' });
    }

    const existing = await getOne(`
      SELECT * FROM neuron_messages 
      WHERE message_type = 'conflict_flag' AND acknowledged = false
        AND metadata->>'resource_type' = $1 AND metadata->>'resource_id' = $2
        AND created_at > NOW() - INTERVAL '1 hour'
      ORDER BY created_at DESC LIMIT 1
    `, [resource_type, resource_id]);

    res.json({
      data: {
        conflict_exists: !!existing,
        claimed_by: existing?.sender_agent || null,
        claimed_at: existing?.created_at || null,
        requesting_agent: requesting_agent || null,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/protocol-stats', async (_req: Request, res: Response) => {
  try {
    const stats = await getOne(`
      SELECT 
        COUNT(*)::text as total_messages_7d,
        COUNT(*) FILTER (WHERE message_type = 'briefing')::text as briefings,
        COUNT(*) FILTER (WHERE message_type = 'handoff')::text as handoffs,
        COUNT(*) FILTER (WHERE message_type = 'conflict_flag')::text as conflicts,
        COUNT(*) FILTER (WHERE message_type = 'task_assignment')::text as task_assignments,
        COUNT(*) FILTER (WHERE message_type = 'task_completion')::text as task_completions,
        COUNT(*) FILTER (WHERE acknowledged = true)::text as acknowledged,
        COUNT(*) FILTER (WHERE acknowledged = false)::text as unacknowledged
      FROM neuron_messages WHERE created_at > NOW() - INTERVAL '7 days'
    `);

    const ackRate = parseInt(stats?.total_messages_7d || '0') > 0
      ? Math.round((parseInt(stats?.acknowledged || '0') / parseInt(stats?.total_messages_7d || '1')) * 100)
      : 0;

    res.json({ data: { ...stats, acknowledgment_rate_pct: ackRate } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
