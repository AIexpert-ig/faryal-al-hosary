import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// GET /api/payments/rental/:rentalId - All payments for a rental
router.get('/rental/:rentalId', async (req, res, next) => {
  try {
    const { rentalId } = req.params;

    // Verify rental exists
    const rentalCheck = await pool.query(
      'SELECT id, rental_code, total_amount, amount_paid, status FROM rentals WHERE id = $1',
      [rentalId]
    );

    if (!rentalCheck.rows[0]) {
      return res.status(404).json({ error: 'Rental not found.' });
    }

    const result = await pool.query(
      `SELECT * FROM payments WHERE rental_id = $1 ORDER BY paid_at DESC`,
      [rentalId]
    );

    const rental = rentalCheck.rows[0];
    const balance = parseFloat(rental.total_amount || 0) - parseFloat(rental.amount_paid || 0);

    res.json({
      payments: result.rows,
      total_payments: result.rows.length,
      rental_summary: {
        rental_code: rental.rental_code,
        total_amount: rental.total_amount,
        amount_paid: rental.amount_paid,
        balance_due: balance.toFixed(2),
        status: rental.status,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments - Create a payment
router.post('/', async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      rental_id,
      amount,
      payment_type,
      payment_method,
      transaction_reference,
      notes,
    } = req.body;

    if (!rental_id || amount === undefined || !payment_type || !payment_method) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'rental_id, amount, payment_type, and payment_method are required.',
      });
    }

    const validPaymentTypes = ['Deposit', 'Rental Fee', 'Security Deposit', 'Refund', 'Penalty'];
    if (!validPaymentTypes.includes(payment_type)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `Invalid payment_type. Must be one of: ${validPaymentTypes.join(', ')}`,
      });
    }

    const validPaymentMethods = ['Cash', 'Credit Card', 'Bank Transfer', 'Check', 'Other'];
    if (!validPaymentMethods.includes(payment_method)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `Invalid payment_method. Must be one of: ${validPaymentMethods.join(', ')}`,
      });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Amount must be a non-zero number.' });
    }

    // Verify rental exists
    const rentalResult = await client.query(
      'SELECT id, amount_paid FROM rentals WHERE id = $1',
      [rental_id]
    );

    if (!rentalResult.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Rental not found.' });
    }

    // Insert payment
    const paymentResult = await client.query(
      `INSERT INTO payments (rental_id, amount, payment_type, payment_method, transaction_reference, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        rental_id,
        parsedAmount,
        payment_type,
        payment_method,
        transaction_reference || null,
        notes || null,
      ]
    );

    // Update rental.amount_paid
    // For refunds, subtract; for all other types, add
    const amountDelta = payment_type === 'Refund' ? -parsedAmount : parsedAmount;
    const currentPaid = parseFloat(rentalResult.rows[0].amount_paid || 0);
    const newAmountPaid = Math.max(0, currentPaid + amountDelta);

    await client.query(
      'UPDATE rentals SET amount_paid = $1 WHERE id = $2',
      [newAmountPaid, rental_id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      payment: paymentResult.rows[0],
      new_amount_paid: newAmountPaid,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// DELETE /api/payments/:id - Delete a payment (Admin/Manager only)
router.delete('/:id', async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;

    if (!['Admin', 'Manager'].includes(req.user.role)) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Insufficient permissions to delete payments.' });
    }

    const paymentResult = await client.query(
      'SELECT * FROM payments WHERE id = $1',
      [id]
    );

    if (!paymentResult.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Payment not found.' });
    }

    const payment = paymentResult.rows[0];

    // Reverse the effect on rental.amount_paid
    const rentalResult = await client.query(
      'SELECT amount_paid FROM rentals WHERE id = $1',
      [payment.rental_id]
    );

    const currentPaid = parseFloat(rentalResult.rows[0]?.amount_paid || 0);
    const reversalDelta = payment.payment_type === 'Refund'
      ? parseFloat(payment.amount)
      : -parseFloat(payment.amount);
    const newAmountPaid = Math.max(0, currentPaid + reversalDelta);

    await client.query('DELETE FROM payments WHERE id = $1', [id]);

    await client.query(
      'UPDATE rentals SET amount_paid = $1 WHERE id = $2',
      [newAmountPaid, payment.rental_id]
    );

    await client.query('COMMIT');

    res.json({ message: 'Payment deleted and rental balance updated.', new_amount_paid: newAmountPaid });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

export default router;
