import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// GET /api/dashboard - Main dashboard stats
router.get('/', async (req, res, next) => {
  try {
    // Run all queries in parallel for performance
    const [
      todayPickupsResult,
      todayReturnsResult,
      activeRentalsResult,
      availableUnitsResult,
      overdueRentalsResult,
      monthRevenueResult,
      pendingMaintenanceResult,
    ] = await Promise.all([
      // Today's pickups count
      pool.query(`SELECT COUNT(*) FROM todays_pickups`),

      // Today's returns count
      pool.query(`SELECT COUNT(*) FROM todays_returns`),

      // Active rentals (Out + Confirmed + Reserved)
      pool.query(`SELECT COUNT(*) FROM rentals WHERE status IN ('Out', 'Confirmed', 'Reserved')`),

      // Available inventory units
      pool.query(`SELECT COUNT(*) FROM inventory_units WHERE status = 'Available'`),

      // Overdue rentals (return_date passed but still Out)
      pool.query(`
        SELECT COUNT(*) FROM rentals
        WHERE status = 'Out' AND return_date < CURRENT_DATE
      `),

      // Current month revenue
      pool.query(`
        SELECT
          COALESCE(SUM(total_amount), 0) AS total_revenue,
          COALESCE(SUM(amount_paid), 0) AS collected_revenue,
          COUNT(*) AS rental_count
        FROM rentals
        WHERE status NOT IN ('Cancelled', 'Inquiry')
          AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
      `),

      // Pending maintenance
      pool.query(`SELECT COUNT(*) FROM maintenance_logs WHERE status IN ('Pending', 'In Progress')`),
    ]);

    res.json({
      today_pickups: parseInt(todayPickupsResult.rows[0].count),
      today_returns: parseInt(todayReturnsResult.rows[0].count),
      active_rentals: parseInt(activeRentalsResult.rows[0].count),
      available_units: parseInt(availableUnitsResult.rows[0].count),
      overdue_rentals: parseInt(overdueRentalsResult.rows[0].count),
      pending_maintenance: parseInt(pendingMaintenanceResult.rows[0].count),
      month_revenue: {
        total: parseFloat(monthRevenueResult.rows[0].total_revenue),
        collected: parseFloat(monthRevenueResult.rows[0].collected_revenue),
        rental_count: parseInt(monthRevenueResult.rows[0].rental_count),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/revenue - Monthly revenue (last 12 months)
router.get('/revenue', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        month,
        rental_count,
        COALESCE(total_revenue, 0) AS total_revenue,
        COALESCE(collected_revenue, 0) AS collected_revenue
      FROM monthly_revenue
      WHERE month >= DATE_TRUNC('month', NOW() - INTERVAL '11 months')
      ORDER BY month ASC
    `);

    // Fill in missing months with zero values
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = d.toISOString().substring(0, 7); // YYYY-MM
      const found = result.rows.find(
        (r) => new Date(r.month).toISOString().substring(0, 7) === monthKey
      );
      months.push({
        month: monthKey,
        month_label: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        rental_count: found ? parseInt(found.rental_count) : 0,
        total_revenue: found ? parseFloat(found.total_revenue) : 0,
        collected_revenue: found ? parseFloat(found.collected_revenue) : 0,
      });
    }

    res.json({ revenue: months });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/popular-gowns - Top 10 most rented gown models
router.get('/popular-gowns', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        gm.id,
        gm.name AS gown_name,
        gm.category,
        gm.rental_price_day,
        gm.primary_image_url,
        d.name AS designer_name,
        COUNT(r.id) AS rental_count,
        COALESCE(SUM(r.total_amount), 0) AS total_revenue
      FROM gown_models gm
      LEFT JOIN inventory_units iu ON iu.gown_model_id = gm.id
      LEFT JOIN rentals r ON r.inventory_unit_id = iu.id
        AND r.status NOT IN ('Cancelled', 'Inquiry')
      LEFT JOIN designers d ON gm.designer_id = d.id
      GROUP BY gm.id, gm.name, gm.category, gm.rental_price_day, gm.primary_image_url, d.name
      ORDER BY rental_count DESC, total_revenue DESC
      LIMIT 10
    `);

    res.json({ popular_gowns: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/upcoming - Upcoming pickups and returns (next 7 days)
router.get('/upcoming', async (req, res, next) => {
  try {
    const [pickupsResult, returnsResult] = await Promise.all([
      pool.query(`
        SELECT r.id, r.rental_code, r.pickup_date, r.status,
               c.first_name, c.last_name, c.phone,
               iu.sku, gm.name AS gown_name
        FROM rentals r
        JOIN customers c ON r.customer_id = c.id
        JOIN inventory_units iu ON r.inventory_unit_id = iu.id
        JOIN gown_models gm ON iu.gown_model_id = gm.id
        WHERE r.pickup_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
          AND r.status IN ('Confirmed', 'Reserved')
        ORDER BY r.pickup_date ASC
      `),
      pool.query(`
        SELECT r.id, r.rental_code, r.return_date, r.status,
               c.first_name, c.last_name, c.phone,
               iu.sku, gm.name AS gown_name
        FROM rentals r
        JOIN customers c ON r.customer_id = c.id
        JOIN inventory_units iu ON r.inventory_unit_id = iu.id
        JOIN gown_models gm ON iu.gown_model_id = gm.id
        WHERE r.return_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
          AND r.status = 'Out'
        ORDER BY r.return_date ASC
      `),
    ]);

    res.json({
      upcoming_pickups: pickupsResult.rows,
      upcoming_returns: returnsResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/overdue - All overdue rentals
router.get('/overdue', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        r.id, r.rental_code, r.pickup_date, r.return_date, r.status,
        CURRENT_DATE - r.return_date AS days_overdue,
        r.total_amount, r.amount_paid,
        c.first_name, c.last_name, c.email AS customer_email, c.phone AS customer_phone,
        iu.sku, gm.name AS gown_name
      FROM rentals r
      JOIN customers c ON r.customer_id = c.id
      JOIN inventory_units iu ON r.inventory_unit_id = iu.id
      JOIN gown_models gm ON iu.gown_model_id = gm.id
      WHERE r.status = 'Out' AND r.return_date < CURRENT_DATE
      ORDER BY r.return_date ASC
    `);

    res.json({ overdue_rentals: result.rows, total: result.rows.length });
  } catch (err) {
    next(err);
  }
});

export default router;
