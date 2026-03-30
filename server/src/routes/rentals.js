import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Helper: generate rental code like FH-2025-001
async function generateRentalCode() {
  const year = new Date().getFullYear();
  const prefix = `FH-${year}-`;

  const result = await pool.query(
    `SELECT rental_code FROM rentals WHERE rental_code LIKE $1 ORDER BY rental_code DESC LIMIT 1`,
    [`${prefix}%`]
  );

  if (result.rows.length === 0) {
    return `${prefix}001`;
  }

  const lastCode = result.rows[0].rental_code;
  const lastNum = parseInt(lastCode.split('-')[2], 10);
  const nextNum = String(lastNum + 1).padStart(3, '0');
  return `${prefix}${nextNum}`;
}

// GET /api/rentals/today/pickups
router.get('/today/pickups', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM todays_pickups ORDER BY pickup_date');
    res.json({ pickups: result.rows, total: result.rows.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/rentals/today/returns
router.get('/today/returns', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM todays_returns ORDER BY return_date');
    res.json({ returns: result.rows, total: result.rows.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/rentals
router.get('/', async (req, res, next) => {
  try {
    const { status, customer_id, from_date, to_date, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (status) {
      params.push(status);
      whereClause += ` AND r.status = $${params.length}`;
    }

    if (customer_id) {
      params.push(customer_id);
      whereClause += ` AND r.customer_id = $${params.length}`;
    }

    if (from_date) {
      params.push(from_date);
      whereClause += ` AND r.pickup_date >= $${params.length}`;
    }

    if (to_date) {
      params.push(to_date);
      whereClause += ` AND r.return_date <= $${params.length}`;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM rentals r ${whereClause}`,
      params
    );

    params.push(parseInt(limit));
    params.push(offset);

    const result = await pool.query(
      `SELECT r.*,
              c.first_name, c.last_name, c.email AS customer_email, c.phone AS customer_phone,
              iu.sku, gm.name AS gown_name, gm.category,
              d.name AS designer_name
       FROM rentals r
       JOIN customers c ON r.customer_id = c.id
       JOIN inventory_units iu ON r.inventory_unit_id = iu.id
       JOIN gown_models gm ON iu.gown_model_id = gm.id
       LEFT JOIN designers d ON gm.designer_id = d.id
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      rentals: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/rentals/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT r.*,
              c.first_name, c.last_name, c.email AS customer_email, c.phone AS customer_phone,
              c.address, c.city, c.bust_cm, c.waist_cm, c.hips_cm, c.hollow_to_hem_cm, c.height_cm, c.shoe_size,
              iu.sku, iu.size, iu.size_numeric, iu.condition_rating,
              gm.name AS gown_name, gm.category, gm.style, gm.color, gm.fabric,
              gm.primary_image_url,
              d.name AS designer_name
       FROM rentals r
       JOIN customers c ON r.customer_id = c.id
       JOIN inventory_units iu ON r.inventory_unit_id = iu.id
       JOIN gown_models gm ON iu.gown_model_id = gm.id
       LEFT JOIN designers d ON gm.designer_id = d.id
       WHERE r.id = $1`,
      [id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Rental not found.' });
    }

    // Status history
    const historyResult = await pool.query(
      `SELECT rsh.*, u.first_name || ' ' || u.last_name AS changed_by_name
       FROM rental_status_history rsh
       LEFT JOIN users u ON rsh.changed_by = u.id
       WHERE rsh.rental_id = $1
       ORDER BY rsh.changed_at DESC`,
      [id]
    );

    // Payments
    const paymentsResult = await pool.query(
      `SELECT * FROM payments WHERE rental_id = $1 ORDER BY paid_at DESC`,
      [id]
    );

    res.json({
      rental: result.rows[0],
      status_history: historyResult.rows,
      payments: paymentsResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/rentals
router.post('/', async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      customer_id,
      inventory_unit_id,
      pickup_date,
      return_date,
      daily_rate,
      security_deposit,
      discount_amount = 0,
      special_requests,
      staff_notes,
    } = req.body;

    if (!customer_id || !inventory_unit_id || !pickup_date || !return_date || !daily_rate || security_deposit === undefined) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'customer_id, inventory_unit_id, pickup_date, return_date, daily_rate, and security_deposit are required.',
      });
    }

    // Validate dates
    const pickupDateObj = new Date(pickup_date);
    const returnDateObj = new Date(return_date);
    if (returnDateObj <= pickupDateObj) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'return_date must be after pickup_date.' });
    }

    // Check unit availability
    const availResult = await client.query(
      'SELECT check_unit_availability($1, $2, $3) AS is_available',
      [inventory_unit_id, pickup_date, return_date]
    );

    if (!availResult.rows[0].is_available) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        error: 'This inventory unit is not available for the selected dates.',
      });
    }

    // Calculate financials
    const rentalDays = Math.ceil((returnDateObj - pickupDateObj) / (1000 * 60 * 60 * 24));
    const subtotal = parseFloat(daily_rate) * rentalDays;
    const discountAmt = parseFloat(discount_amount) || 0;
    const totalAmount = subtotal - discountAmt + parseFloat(security_deposit);

    // Generate rental code
    const rentalCode = await generateRentalCode();

    const result = await client.query(
      `INSERT INTO rentals (
        rental_code, customer_id, inventory_unit_id,
        pickup_date, return_date, rental_days, daily_rate,
        subtotal, security_deposit, discount_amount, total_amount,
        special_requests, staff_notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        rentalCode,
        customer_id,
        inventory_unit_id,
        pickup_date,
        return_date,
        rentalDays,
        parseFloat(daily_rate),
        subtotal,
        parseFloat(security_deposit),
        discountAmt,
        totalAmount,
        special_requests || null,
        staff_notes || null,
        req.user.id,
      ]
    );

    // Update inventory unit status to Reserved
    await client.query(
      `UPDATE inventory_units SET status = 'Reserved' WHERE id = $1`,
      [inventory_unit_id]
    );

    await client.query('COMMIT');

    res.status(201).json({ rental: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// PATCH /api/rentals/:id/status
router.patch('/:id/status', async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { status, notes, actual_return_date } = req.body;

    const validStatuses = ['Inquiry', 'Reserved', 'Confirmed', 'Out', 'Returned', 'Complete', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const existing = await client.query(
      'SELECT id, status, inventory_unit_id FROM rentals WHERE id = $1',
      [id]
    );

    if (!existing.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Rental not found.' });
    }

    const currentRental = existing.rows[0];

    // Build update fields
    const updateFields = { status };
    if (status === 'Returned' && actual_return_date) {
      updateFields.actual_return_date = actual_return_date;
    }
    if (status === 'Out') {
      // Update inventory unit to Rented
      await client.query(
        `UPDATE inventory_units SET status = 'Rented' WHERE id = $1`,
        [currentRental.inventory_unit_id]
      );
    }
    if (status === 'Cancelled' || status === 'Complete') {
      // Free up the inventory unit
      await client.query(
        `UPDATE inventory_units SET status = 'Available' WHERE id = $1`,
        [currentRental.inventory_unit_id]
      );
    }

    let updateQuery = `UPDATE rentals SET status = $1, updated_at = NOW()`;
    const queryParams = [status];

    if (actual_return_date) {
      queryParams.push(actual_return_date);
      updateQuery += `, actual_return_date = $${queryParams.length}`;
    }

    queryParams.push(id);
    updateQuery += ` WHERE id = $${queryParams.length} RETURNING *`;

    const result = await client.query(updateQuery, queryParams);

    // Log the status change manually with user and notes
    await client.query(
      `INSERT INTO rental_status_history (rental_id, previous_status, new_status, changed_by, notes)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, currentRental.status, status, req.user.id, notes || null]
    );

    await client.query('COMMIT');

    res.json({ rental: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

export default router;
