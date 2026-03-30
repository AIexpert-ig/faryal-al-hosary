import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// GET /api/customers
router.get('/', async (req, res, next) => {
  try {
    const { search, city, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (first_name ILIKE $${params.length} OR last_name ILIKE $${params.length} OR email ILIKE $${params.length} OR phone ILIKE $${params.length})`;
    }

    if (city) {
      params.push(city);
      whereClause += ` AND city = $${params.length}`;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM customers ${whereClause}`,
      params
    );

    params.push(parseInt(limit));
    params.push(offset);

    const result = await pool.query(
      `SELECT * FROM customers ${whereClause} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      customers: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/customers/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    // Also fetch rental history for this customer
    const rentalsResult = await pool.query(
      `SELECT r.id, r.rental_code, r.pickup_date, r.return_date, r.status, r.total_amount, r.amount_paid,
              gm.name AS gown_name, iu.sku
       FROM rentals r
       JOIN inventory_units iu ON r.inventory_unit_id = iu.id
       JOIN gown_models gm ON iu.gown_model_id = gm.id
       WHERE r.customer_id = $1
       ORDER BY r.created_at DESC`,
      [id]
    );

    res.json({
      customer: result.rows[0],
      rental_history: rentalsResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/customers
router.post('/', async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      emergency_contact_name,
      emergency_contact_phone,
      bust_cm,
      waist_cm,
      hips_cm,
      hollow_to_hem_cm,
      height_cm,
      shoe_size,
      notes,
    } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'First name, last name, and email are required.' });
    }

    const result = await pool.query(
      `INSERT INTO customers (
        first_name, last_name, email, phone, address, city,
        emergency_contact_name, emergency_contact_phone,
        bust_cm, waist_cm, hips_cm, hollow_to_hem_cm, height_cm, shoe_size, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        first_name.trim(),
        last_name.trim(),
        email.toLowerCase().trim(),
        phone || null,
        address || null,
        city || null,
        emergency_contact_name || null,
        emergency_contact_phone || null,
        bust_cm || null,
        waist_cm || null,
        hips_cm || null,
        hollow_to_hem_cm || null,
        height_cm || null,
        shoe_size || null,
        notes || null,
      ]
    );

    res.status(201).json({ customer: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// PUT /api/customers/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      emergency_contact_name,
      emergency_contact_phone,
      bust_cm,
      waist_cm,
      hips_cm,
      hollow_to_hem_cm,
      height_cm,
      shoe_size,
      notes,
    } = req.body;

    const existing = await pool.query('SELECT id FROM customers WHERE id = $1', [id]);
    if (!existing.rows[0]) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    const result = await pool.query(
      `UPDATE customers SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        address = COALESCE($5, address),
        city = COALESCE($6, city),
        emergency_contact_name = COALESCE($7, emergency_contact_name),
        emergency_contact_phone = COALESCE($8, emergency_contact_phone),
        bust_cm = COALESCE($9, bust_cm),
        waist_cm = COALESCE($10, waist_cm),
        hips_cm = COALESCE($11, hips_cm),
        hollow_to_hem_cm = COALESCE($12, hollow_to_hem_cm),
        height_cm = COALESCE($13, height_cm),
        shoe_size = COALESCE($14, shoe_size),
        notes = COALESCE($15, notes)
      WHERE id = $16
      RETURNING *`,
      [
        first_name ? first_name.trim() : null,
        last_name ? last_name.trim() : null,
        email ? email.toLowerCase().trim() : null,
        phone !== undefined ? phone : null,
        address !== undefined ? address : null,
        city !== undefined ? city : null,
        emergency_contact_name !== undefined ? emergency_contact_name : null,
        emergency_contact_phone !== undefined ? emergency_contact_phone : null,
        bust_cm !== undefined ? bust_cm : null,
        waist_cm !== undefined ? waist_cm : null,
        hips_cm !== undefined ? hips_cm : null,
        hollow_to_hem_cm !== undefined ? hollow_to_hem_cm : null,
        height_cm !== undefined ? height_cm : null,
        shoe_size !== undefined ? shoe_size : null,
        notes !== undefined ? notes : null,
        id,
      ]
    );

    res.json({ customer: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/customers/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check for active rentals
    const activeRentals = await pool.query(
      `SELECT COUNT(*) FROM rentals WHERE customer_id = $1 AND status NOT IN ('Complete', 'Cancelled')`,
      [id]
    );

    if (parseInt(activeRentals.rows[0].count) > 0) {
      return res.status(409).json({
        error: 'Cannot delete customer with active rentals.',
      });
    }

    const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING id', [id]);

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    res.json({ message: 'Customer deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
