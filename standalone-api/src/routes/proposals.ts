import { Router, Request, Response } from 'express';
import { query, getMany, getOne } from '../db.js';
import crypto from 'crypto';

const router = Router();
const uuid = () => crypto.randomUUID();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const proposals = await getMany(`
      SELECT p.*,
        (SELECT COUNT(*) FROM proposal_boxes pb WHERE pb.proposal_id = p.id) as box_count,
        (SELECT COUNT(*) FROM proposal_connections pc WHERE pc.proposal_id = p.id) as connection_count
      FROM proposals p ORDER BY p.created_at DESC
    `);
    res.json({ data: proposals });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, meeting_id, created_by } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const id = uuid();
    const proposal = await getOne(`
      INSERT INTO proposals (id, title, description, meeting_id, created_by, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, 'draft', NOW(), NOW())
      RETURNING *
    `, [id, title, description || null, meeting_id || null, created_by || 'system']);

    res.status(201).json({ data: proposal });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const proposal = await getOne('SELECT * FROM proposals WHERE id = $1', [id]);
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });

    const boxes = await getMany('SELECT * FROM proposal_boxes WHERE proposal_id = $1 ORDER BY created_at', [id]);
    const connections = await getMany('SELECT * FROM proposal_connections WHERE proposal_id = $1 ORDER BY created_at', [id]);

    res.json({ data: { ...proposal, boxes, connections } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/boxes', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, box_type, position_x, position_y, width, height, color, agent_name } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const bid = uuid();
    const box = await getOne(`
      INSERT INTO proposal_boxes (id, proposal_id, title, content, box_type, position_x, position_y, width, height, color, agent_name, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *
    `, [bid, id, title, content || null, box_type || 'idea', position_x || 0, position_y || 0, width || 200, height || 100, color || '#ffbf00', agent_name || null]);

    res.status(201).json({ data: box });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/boxes/:bid', async (req: Request, res: Response) => {
  try {
    const { bid } = req.params;
    const fields = req.body;
    const allowed = ['title', 'content', 'box_type', 'position_x', 'position_y', 'width', 'height', 'color', 'agent_name'];
    const sets: string[] = [];
    const vals: any[] = [];
    let i = 1;

    for (const [k, v] of Object.entries(fields)) {
      if (allowed.includes(k)) {
        sets.push(`${k} = $${i++}`);
        vals.push(v);
      }
    }

    if (sets.length === 0) return res.status(400).json({ error: 'No valid fields' });

    vals.push(bid);
    const box = await getOne(`UPDATE proposal_boxes SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ data: box });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/boxes/:bid', async (req: Request, res: Response) => {
  try {
    const { bid } = req.params;
    await query('DELETE FROM proposal_connections WHERE from_box_id = $1 OR to_box_id = $1', [bid]);
    await query('DELETE FROM proposal_boxes WHERE id = $1', [bid]);
    res.json({ data: { deleted: true } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/connections', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { from_box_id, to_box_id, label, connection_type } = req.body;
    if (!from_box_id || !to_box_id) return res.status(400).json({ error: 'from_box_id and to_box_id are required' });

    const cid = uuid();
    const conn = await getOne(`
      INSERT INTO proposal_connections (id, proposal_id, from_box_id, to_box_id, label, connection_type, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `, [cid, id, from_box_id, to_box_id, label || null, connection_type || 'arrow']);

    res.status(201).json({ data: conn });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/connections/:cid', async (req: Request, res: Response) => {
  try {
    const { cid } = req.params;
    await query('DELETE FROM proposal_connections WHERE id = $1', [cid]);
    res.json({ data: { deleted: true } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/auto-align', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const boxes = await getMany('SELECT * FROM proposal_boxes WHERE proposal_id = $1 ORDER BY created_at', [id]);
    
    const cols = Math.ceil(Math.sqrt(boxes.length));
    const spacing = 250;
    for (let idx = 0; idx < boxes.length; idx++) {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      await query('UPDATE proposal_boxes SET position_x = $1, position_y = $2 WHERE id = $3',
        [col * spacing + 50, row * spacing + 50, boxes[idx].id]);
    }

    const updated = await getMany('SELECT * FROM proposal_boxes WHERE proposal_id = $1 ORDER BY created_at', [id]);
    res.json({ data: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
