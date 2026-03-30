import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// GET /api/gown-models
router.get('/', async (req, res, next) => {
  try {
    const { category, designer_id, is_active, search, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (category) {
      params.push(category);
      whereClause += ` AND gm.category = $${params.length}`;
    }

    if (designer_id) {
      params.push(designer_id);
      whereClause += ` AND gm.designer_id = $${params.length}`;
    }

    if (is_active !== undefined) {
      params.push(is_active === 'true');
      whereClause += ` AND gm.is_active = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (gm.name ILIKE $${params.length} OR gm.style ILIKE $${params.length} OR gm.color ILIKE $${params.length})`;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM gown_models gm ${whereClause}`,
      params
    );

    params.push(parseInt(limit));
    params.push(offset);

    const result = await pool.query(
      `SELECT gm.*,
              d.name AS designer_name, d.country AS designer_country,
              COUNT(iu.id) AS total_units,
              COUNT(CASE WHEN iu.status = 'Available' THEN 1 END) AS available_units
       FROM gown_models gm
       LEFT JOIN designers d ON gm.designer_id = d.id
       LEFT JOIN inventory_units iu ON iu.gown_model_id = gm.id
       ${whereClause}
       GROUP BY gm.id, d.name, d.country
       ORDER BY gm.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      gown_models: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/gown-models/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT gm.*,
              d.name AS designer_name, d.country AS designer_country, d.website AS designer_website
       FROM gown_models gm
       LEFT JOIN designers d ON gm.designer_id = d.id
       WHERE gm.id = $1`,
      [id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Gown model not found.' });
    }

    // Fetch inventory units for this model
    const unitsResult = await pool.query(
      `SELECT id, sku, size, size_numeric, status, condition_rating, storage_location
       FROM inventory_units
       WHERE gown_model_id = $1
       ORDER BY sku`,
      [id]
    );

    res.json({
      gown_model: result.rows[0],
      inventory_units: unitsResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/gown-models
router.post('/', async (req, res, next) => {
  try {
    const {
      name,
      designer_id,
      category,
      style,
      color,
      fabric,
      description,
      purchase_cost,
      rental_price_day,
      security_deposit,
      primary_image_url,
      additional_images,
      is_active = true,
    } = req.body;

    if (!name || rental_price_day === undefined || security_deposit === undefined) {
      return res.status(400).json({
        error: 'name, rental_price_day, and security_deposit are required.',
      });
    }

    const result = await pool.query(
      `INSERT INTO gown_models (
        name, designer_id, category, style, color, fabric, description,
        purchase_cost, rental_price_day, security_deposit,
        primary_image_url, additional_images, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        name.trim(),
        designer_id || null,
        category || null,
        style || null,
        color || null,
        fabric || null,
        description || null,
        purchase_cost || null,
        parseFloat(rental_price_day),
        parseFloat(security_deposit),
        primary_image_url || null,
        additional_images || null,
        is_active,
      ]
    );

    res.status(201).json({ gown_model: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// PUT /api/gown-models/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      designer_id,
      category,
      style,
      color,
      fabric,
      description,
      purchase_cost,
      rental_price_day,
      security_deposit,
      primary_image_url,
      additional_images,
      is_active,
    } = req.body;

    const existing = await pool.query('SELECT id FROM gown_models WHERE id = $1', [id]);
    if (!existing.rows[0]) {
      return res.status(404).json({ error: 'Gown model not found.' });
    }

    const result = await pool.query(
      `UPDATE gown_models SET
        name = COALESCE($1, name),
        designer_id = COALESCE($2, designer_id),
        category = COALESCE($3, category),
        style = COALESCE($4, style),
        color = COALESCE($5, color),
        fabric = COALESCE($6, fabric),
        description = COALESCE($7, description),
        purchase_cost = COALESCE($8, purchase_cost),
        rental_price_day = COALESCE($9, rental_price_day),
        security_deposit = COALESCE($10, security_deposit),
        primary_image_url = COALESCE($11, primary_image_url),
        additional_images = COALESCE($12, additional_images),
        is_active = COALESCE($13, is_active)
      WHERE id = $14
      RETURNING *`,
      [
        name ? name.trim() : null,
        designer_id !== undefined ? designer_id : null,
        category || null,
        style !== undefined ? style : null,
        color !== undefined ? color : null,
        fabric !== undefined ? fabric : null,
        description !== undefined ? description : null,
        purchase_cost !== undefined ? purchase_cost : null,
        rental_price_day !== undefined ? parseFloat(rental_price_day) : null,
        security_deposit !== undefined ? parseFloat(security_deposit) : null,
        primary_image_url !== undefined ? primary_image_url : null,
        additional_images !== undefined ? additional_images : null,
        is_active !== undefined ? is_active : null,
        id,
      ]
    );

    res.json({ gown_model: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
