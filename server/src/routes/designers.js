import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// GET /api/designers
router.get('/', async (req, res, next) => {
  try {
    const { search, country } = req.query;
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (d.name ILIKE $${params.length} OR d.country ILIKE $${params.length})`;
    }

    if (country) {
      params.push(country);
      whereClause += ` AND d.country = $${params.length}`;
    }

    const result = await pool.query(
      `SELECT d.*,
              COUNT(gm.id) AS gown_model_count
       FROM designers d
       LEFT JOIN gown_models gm ON gm.designer_id = d.id
       ${whereClause}
       GROUP BY d.id
       ORDER BY d.name ASC`,
      params
    );

    res.json({ designers: result.rows, total: result.rows.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/designers/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM designers WHERE id = $1', [id]);

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Designer not found.' });
    }

    // Fetch gown models by this designer
    const gownsResult = await pool.query(
      `SELECT id, name, category, style, color, rental_price_day, is_active,
              (SELECT COUNT(*) FROM inventory_units WHERE gown_model_id = gown_models.id) AS unit_count
       FROM gown_models
       WHERE designer_id = $1
       ORDER BY name ASC`,
      [id]
    );

    res.json({
      designer: result.rows[0],
      gown_models: gownsResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/designers
router.post('/', async (req, res, next) => {
  try {
    const { name, country, website, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Designer name is required.' });
    }

    const result = await pool.query(
      `INSERT INTO designers (name, country, website, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        name.trim(),
        country || null,
        website || null,
        description || null,
      ]
    );

    res.status(201).json({ designer: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// PUT /api/designers/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, country, website, description } = req.body;

    const existing = await pool.query('SELECT id FROM designers WHERE id = $1', [id]);
    if (!existing.rows[0]) {
      return res.status(404).json({ error: 'Designer not found.' });
    }

    const result = await pool.query(
      `UPDATE designers SET
        name = COALESCE($1, name),
        country = COALESCE($2, country),
        website = COALESCE($3, website),
        description = COALESCE($4, description)
       WHERE id = $5
       RETURNING *`,
      [
        name ? name.trim() : null,
        country !== undefined ? country : null,
        website !== undefined ? website : null,
        description !== undefined ? description : null,
        id,
      ]
    );

    res.json({ designer: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/designers/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check for gown models linked to this designer
    const linkedGowns = await pool.query(
      'SELECT COUNT(*) FROM gown_models WHERE designer_id = $1',
      [id]
    );

    if (parseInt(linkedGowns.rows[0].count) > 0) {
      return res.status(409).json({
        error: 'Cannot delete designer with linked gown models. Reassign or delete the gown models first.',
      });
    }

    const result = await pool.query(
      'DELETE FROM designers WHERE id = $1 RETURNING id',
      [id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Designer not found.' });
    }

    res.json({ message: 'Designer deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
