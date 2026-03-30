import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// GET /api/maintenance - All logs with optional filters
router.get('/', async (req, res, next) => {
  try {
    const { status, maintenance_type, inventory_unit_id, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (status) {
      params.push(status);
      whereClause += ` AND ml.status = $${params.length}`;
    }

    if (maintenance_type) {
      params.push(maintenance_type);
      whereClause += ` AND ml.maintenance_type = $${params.length}`;
    }

    if (inventory_unit_id) {
      params.push(inventory_unit_id);
      whereClause += ` AND ml.inventory_unit_id = $${params.length}`;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM maintenance_logs ml ${whereClause}`,
      params
    );

    params.push(parseInt(limit));
    params.push(offset);

    const result = await pool.query(
      `SELECT ml.*,
              iu.sku,
              gm.name AS gown_name,
              r.rental_code
       FROM maintenance_logs ml
       LEFT JOIN inventory_units iu ON ml.inventory_unit_id = iu.id
       LEFT JOIN gown_models gm ON iu.gown_model_id = gm.id
       LEFT JOIN rentals r ON ml.rental_id = r.id
       ${whereClause}
       ORDER BY ml.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      maintenance_logs: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/maintenance/:id - Single log
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT ml.*,
              iu.sku, iu.status AS unit_current_status,
              gm.name AS gown_name,
              r.rental_code
       FROM maintenance_logs ml
       LEFT JOIN inventory_units iu ON ml.inventory_unit_id = iu.id
       LEFT JOIN gown_models gm ON iu.gown_model_id = gm.id
       LEFT JOIN rentals r ON ml.rental_id = r.id
       WHERE ml.id = $1`,
      [id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Maintenance log not found.' });
    }

    res.json({ maintenance_log: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/maintenance - Create maintenance log
router.post('/', async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      inventory_unit_id,
      rental_id,
      maintenance_type,
      start_date,
      end_date,
      description,
      cost,
      performed_by,
      before_photos,
      after_photos,
      status = 'Pending',
      update_unit_status,
    } = req.body;

    if (!inventory_unit_id || !maintenance_type || !start_date) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'inventory_unit_id, maintenance_type, and start_date are required.',
      });
    }

    const validTypes = ['Cleaning', 'Repair', 'Inspection', 'Alteration'];
    if (!validTypes.includes(maintenance_type)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `Invalid maintenance_type. Must be one of: ${validTypes.join(', ')}`,
      });
    }

    // Verify inventory unit exists
    const unitCheck = await client.query(
      'SELECT id FROM inventory_units WHERE id = $1',
      [inventory_unit_id]
    );
    if (!unitCheck.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Inventory unit not found.' });
    }

    const result = await client.query(
      `INSERT INTO maintenance_logs (
        inventory_unit_id, rental_id, maintenance_type, start_date, end_date,
        description, cost, performed_by, before_photos, after_photos, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        inventory_unit_id,
        rental_id || null,
        maintenance_type,
        start_date,
        end_date || null,
        description || null,
        cost || null,
        performed_by || null,
        before_photos || null,
        after_photos || null,
        status,
      ]
    );

    // Optionally update unit status
    if (update_unit_status) {
      const validUnitStatuses = ['Available', 'Reserved', 'Rented', 'Cleaning', 'Repair', 'Retired'];
      if (validUnitStatuses.includes(update_unit_status)) {
        await client.query(
          'UPDATE inventory_units SET status = $1 WHERE id = $2',
          [update_unit_status, inventory_unit_id]
        );
      }
    } else if (maintenance_type === 'Cleaning' || maintenance_type === 'Repair') {
      // Auto-set unit to matching status
      const autoStatus = maintenance_type === 'Cleaning' ? 'Cleaning' : 'Repair';
      await client.query(
        'UPDATE inventory_units SET status = $1 WHERE id = $2',
        [autoStatus, inventory_unit_id]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({ maintenance_log: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// PATCH /api/maintenance/:id/complete - Mark complete, set unit Available
router.patch('/:id/complete', async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { after_photos, cost, performed_by, notes } = req.body;

    const existing = await client.query(
      'SELECT * FROM maintenance_logs WHERE id = $1',
      [id]
    );

    if (!existing.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Maintenance log not found.' });
    }

    const log = existing.rows[0];

    if (log.status === 'Complete') {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Maintenance log is already marked as complete.' });
    }

    const updateParams = [
      after_photos || log.after_photos,
      cost !== undefined ? cost : log.cost,
      performed_by || log.performed_by,
      notes ? (log.description ? `${log.description}\n\nCompletion notes: ${notes}` : notes) : log.description,
      id,
    ];

    const result = await client.query(
      `UPDATE maintenance_logs SET
        status = 'Complete',
        end_date = COALESCE(end_date, CURRENT_DATE),
        after_photos = $1,
        cost = $2,
        performed_by = $3,
        description = $4
       WHERE id = $5
       RETURNING *`,
      updateParams
    );

    // Set inventory unit back to Available
    await client.query(
      `UPDATE inventory_units SET status = 'Available' WHERE id = $1`,
      [log.inventory_unit_id]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Maintenance marked as complete. Inventory unit is now Available.',
      maintenance_log: result.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// PATCH /api/maintenance/:id - Update maintenance log
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      maintenance_type,
      start_date,
      end_date,
      description,
      cost,
      performed_by,
      before_photos,
      after_photos,
      status,
    } = req.body;

    const existing = await pool.query('SELECT id FROM maintenance_logs WHERE id = $1', [id]);
    if (!existing.rows[0]) {
      return res.status(404).json({ error: 'Maintenance log not found.' });
    }

    const result = await pool.query(
      `UPDATE maintenance_logs SET
        maintenance_type = COALESCE($1, maintenance_type),
        start_date = COALESCE($2, start_date),
        end_date = COALESCE($3, end_date),
        description = COALESCE($4, description),
        cost = COALESCE($5, cost),
        performed_by = COALESCE($6, performed_by),
        before_photos = COALESCE($7, before_photos),
        after_photos = COALESCE($8, after_photos),
        status = COALESCE($9, status)
       WHERE id = $10
       RETURNING *`,
      [
        maintenance_type || null,
        start_date || null,
        end_date !== undefined ? end_date : null,
        description !== undefined ? description : null,
        cost !== undefined ? cost : null,
        performed_by !== undefined ? performed_by : null,
        before_photos !== undefined ? before_photos : null,
        after_photos !== undefined ? after_photos : null,
        status || null,
        id,
      ]
    );

    res.json({ maintenance_log: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
