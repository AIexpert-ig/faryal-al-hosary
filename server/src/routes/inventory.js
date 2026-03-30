import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// GET /api/inventory
router.get('/', async (req, res, next) => {
  try {
    const { status, gown_model_id, designer_id, size, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (status) {
      params.push(status);
      whereClause += ` AND iu.status = $${params.length}`;
    }

    if (gown_model_id) {
      params.push(gown_model_id);
      whereClause += ` AND iu.gown_model_id = $${params.length}`;
    }

    if (designer_id) {
      params.push(designer_id);
      whereClause += ` AND d.id = $${params.length}`;
    }

    if (size) {
      params.push(size);
      whereClause += ` AND iu.size = $${params.length}`;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM inventory_units iu
       JOIN gown_models gm ON iu.gown_model_id = gm.id
       LEFT JOIN designers d ON gm.designer_id = d.id
       ${whereClause}`,
      params
    );

    params.push(parseInt(limit));
    params.push(offset);

    const result = await pool.query(
      `SELECT iu.*, gm.name AS gown_name, gm.category, gm.rental_price_day, gm.security_deposit,
              d.name AS designer_name, d.id AS designer_id
       FROM inventory_units iu
       JOIN gown_models gm ON iu.gown_model_id = gm.id
       LEFT JOIN designers d ON gm.designer_id = d.id
       ${whereClause}
       ORDER BY iu.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      inventory: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/inventory/available
router.get('/available', async (req, res, next) => {
  try {
    const { from_date, to_date, category, size } = req.query;
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (category) {
      params.push(category);
      whereClause += ` AND category = $${params.length}`;
    }

    if (size) {
      params.push(size);
      whereClause += ` AND size = $${params.length}`;
    }

    let query;
    if (from_date && to_date) {
      // Check against actual bookings for the date range
      query = `
        SELECT iu.*, gm.name AS gown_name, gm.category, gm.rental_price_day, gm.security_deposit,
               d.name AS designer_name
        FROM inventory_units iu
        JOIN gown_models gm ON iu.gown_model_id = gm.id
        LEFT JOIN designers d ON gm.designer_id = d.id
        ${whereClause}
          AND iu.status = 'Available'
          AND NOT EXISTS (
            SELECT 1 FROM rentals r
            WHERE r.inventory_unit_id = iu.id
              AND r.status NOT IN ('Cancelled', 'Complete')
              AND r.pickup_date <= $${params.length + 2}
              AND r.return_date >= $${params.length + 1}
          )
        ORDER BY gm.name, iu.sku
      `;
      params.push(from_date, to_date);
    } else {
      query = `
        SELECT * FROM available_inventory
        ${whereClause.replace('WHERE 1=1', 'WHERE 1=1')}
        ORDER BY gown_name, sku
      `;
    }

    const result = await pool.query(query, params);
    res.json({ inventory: result.rows, total: result.rows.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/inventory/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT iu.*, gm.name AS gown_name, gm.category, gm.style, gm.color, gm.fabric,
              gm.rental_price_day, gm.security_deposit, gm.primary_image_url,
              d.name AS designer_name, d.id AS designer_id
       FROM inventory_units iu
       JOIN gown_models gm ON iu.gown_model_id = gm.id
       LEFT JOIN designers d ON gm.designer_id = d.id
       WHERE iu.id = $1`,
      [id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Inventory unit not found.' });
    }

    // Fetch maintenance history
    const maintenanceResult = await pool.query(
      `SELECT * FROM maintenance_logs WHERE inventory_unit_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [id]
    );

    // Fetch rental history
    const rentalsResult = await pool.query(
      `SELECT r.id, r.rental_code, r.pickup_date, r.return_date, r.status,
              c.first_name, c.last_name, c.phone
       FROM rentals r
       JOIN customers c ON r.customer_id = c.id
       WHERE r.inventory_unit_id = $1
       ORDER BY r.pickup_date DESC LIMIT 10`,
      [id]
    );

    res.json({
      unit: result.rows[0],
      maintenance_history: maintenanceResult.rows,
      rental_history: rentalsResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/inventory/:id/availability
router.get('/:id/availability', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { from_date, to_date, exclude_rental_id } = req.query;

    if (!from_date || !to_date) {
      return res.status(400).json({ error: 'from_date and to_date are required.' });
    }

    const result = await pool.query(
      'SELECT check_unit_availability($1, $2, $3, $4) AS is_available',
      [id, from_date, to_date, exclude_rental_id || null]
    );

    const isAvailable = result.rows[0].is_available;

    // If not available, also return conflicting rentals
    let conflicts = [];
    if (!isAvailable) {
      const conflictResult = await pool.query(
        `SELECT r.id, r.rental_code, r.pickup_date, r.return_date, r.status,
                c.first_name, c.last_name
         FROM rentals r
         JOIN customers c ON r.customer_id = c.id
         WHERE r.inventory_unit_id = $1
           AND r.status NOT IN ('Cancelled', 'Complete')
           AND ($4::UUID IS NULL OR r.id != $4::UUID)
           AND r.pickup_date <= $3
           AND r.return_date >= $2`,
        [id, from_date, to_date, exclude_rental_id || null]
      );
      conflicts = conflictResult.rows;
    }

    res.json({ is_available: isAvailable, conflicts });
  } catch (err) {
    next(err);
  }
});

// POST /api/inventory
router.post('/', async (req, res, next) => {
  try {
    const {
      sku,
      gown_model_id,
      size,
      size_numeric,
      condition_notes,
      condition_rating,
      date_acquired,
      purchase_price,
      storage_location,
      condition_photos,
    } = req.body;

    if (!sku || !gown_model_id) {
      return res.status(400).json({ error: 'SKU and gown_model_id are required.' });
    }

    const result = await pool.query(
      `INSERT INTO inventory_units (
        sku, gown_model_id, size, size_numeric, condition_notes,
        condition_rating, date_acquired, purchase_price, storage_location, condition_photos
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        sku.trim().toUpperCase(),
        gown_model_id,
        size || null,
        size_numeric || null,
        condition_notes || null,
        condition_rating || null,
        date_acquired || null,
        purchase_price || null,
        storage_location || null,
        condition_photos || null,
      ]
    );

    res.status(201).json({ unit: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// PUT /api/inventory/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      sku,
      size,
      size_numeric,
      status,
      condition_notes,
      condition_rating,
      date_acquired,
      purchase_price,
      storage_location,
      condition_photos,
    } = req.body;

    const existing = await pool.query('SELECT id FROM inventory_units WHERE id = $1', [id]);
    if (!existing.rows[0]) {
      return res.status(404).json({ error: 'Inventory unit not found.' });
    }

    const result = await pool.query(
      `UPDATE inventory_units SET
        sku = COALESCE($1, sku),
        size = COALESCE($2, size),
        size_numeric = COALESCE($3, size_numeric),
        status = COALESCE($4, status),
        condition_notes = COALESCE($5, condition_notes),
        condition_rating = COALESCE($6, condition_rating),
        date_acquired = COALESCE($7, date_acquired),
        purchase_price = COALESCE($8, purchase_price),
        storage_location = COALESCE($9, storage_location),
        condition_photos = COALESCE($10, condition_photos)
      WHERE id = $11
      RETURNING *`,
      [
        sku ? sku.trim().toUpperCase() : null,
        size || null,
        size_numeric || null,
        status || null,
        condition_notes !== undefined ? condition_notes : null,
        condition_rating || null,
        date_acquired || null,
        purchase_price || null,
        storage_location || null,
        condition_photos || null,
        id,
      ]
    );

    res.json({ unit: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/inventory/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const activeRentals = await pool.query(
      `SELECT COUNT(*) FROM rentals WHERE inventory_unit_id = $1 AND status NOT IN ('Complete', 'Cancelled')`,
      [id]
    );

    if (parseInt(activeRentals.rows[0].count) > 0) {
      return res.status(409).json({
        error: 'Cannot delete inventory unit with active rentals.',
      });
    }

    const result = await pool.query(
      'DELETE FROM inventory_units WHERE id = $1 RETURNING id',
      [id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Inventory unit not found.' });
    }

    res.json({ message: 'Inventory unit deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
