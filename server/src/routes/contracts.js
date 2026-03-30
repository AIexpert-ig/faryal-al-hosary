import { Router } from 'express';
import PDFDocument from 'pdfkit';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// GET /api/contracts/:rentalId - Generate PDF contract
router.get('/:rentalId', async (req, res, next) => {
  try {
    const { rentalId } = req.params;

    // Fetch full rental details
    const result = await pool.query(
      `SELECT r.*,
              c.first_name, c.last_name, c.email AS customer_email, c.phone AS customer_phone,
              c.address, c.city,
              c.bust_cm, c.waist_cm, c.hips_cm, c.hollow_to_hem_cm, c.height_cm, c.shoe_size,
              iu.sku, iu.size, iu.size_numeric, iu.color AS unit_color,
              gm.name AS gown_name, gm.category, gm.style, gm.color AS gown_color, gm.fabric,
              d.name AS designer_name
       FROM rentals r
       JOIN customers c ON r.customer_id = c.id
       JOIN inventory_units iu ON r.inventory_unit_id = iu.id
       JOIN gown_models gm ON iu.gown_model_id = gm.id
       LEFT JOIN designers d ON gm.designer_id = d.id
       WHERE r.id = $1`,
      [rentalId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Rental not found.' });
    }

    const rental = result.rows[0];

    // Format date helper
    const formatDate = (dateStr) => {
      if (!dateStr) return 'N/A';
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const formatCurrency = (amount) => {
      if (amount === null || amount === undefined) return 'AED 0.00';
      return `AED ${parseFloat(amount).toFixed(2)}`;
    };

    // Create PDF
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 60, bottom: 60, left: 60, right: 60 },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="contract-${rental.rental_code}.pdf"`
    );

    doc.pipe(res);

    // ── HEADER ──────────────────────────────────────────────────────────────
    // Gold accent bar
    doc.rect(0, 0, doc.page.width, 8).fill('#C9A84C');

    doc.moveDown(1.5);

    // Brand name
    doc
      .font('Helvetica-Bold')
      .fontSize(26)
      .fillColor('#1a1a1a')
      .text('FARYAL AL HOSARY', { align: 'center', characterSpacing: 3 });

    doc
      .font('Helvetica')
      .fontSize(11)
      .fillColor('#C9A84C')
      .text('Luxury Bridal Couture & Rental', { align: 'center', characterSpacing: 1 });

    doc.moveDown(0.4);

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#666666')
      .text('Dubai, United Arab Emirates  |  +971 4 000 0000  |  info@faryalalhosary.com', {
        align: 'center',
      });

    // Divider line (gold)
    doc.moveDown(0.8);
    doc
      .moveTo(60, doc.y)
      .lineTo(doc.page.width - 60, doc.y)
      .strokeColor('#C9A84C')
      .lineWidth(1.5)
      .stroke();

    // Contract title
    doc.moveDown(0.8);
    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor('#1a1a1a')
      .text('RENTAL AGREEMENT & CONTRACT', { align: 'center', characterSpacing: 2 });

    doc.moveDown(0.3);
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#555555')
      .text(`Contract Reference: ${rental.rental_code}`, { align: 'center' });

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#555555')
      .text(`Date Issued: ${formatDate(new Date())}`, { align: 'center' });

    doc.moveDown(1);

    // ── SECTION HELPER ──────────────────────────────────────────────────────
    const sectionTitle = (title) => {
      doc.moveDown(0.8);
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#C9A84C')
        .text(title.toUpperCase(), { characterSpacing: 1 });
      doc
        .moveTo(60, doc.y + 2)
        .lineTo(doc.page.width - 60, doc.y + 2)
        .strokeColor('#e0c97a')
        .lineWidth(0.5)
        .stroke();
      doc.moveDown(0.5);
    };

    const labelValue = (label, value, inline = true) => {
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#333333');
      if (inline) {
        doc.text(`${label}: `, { continued: true });
        doc.font('Helvetica').fontSize(9.5).fillColor('#555555').text(value || 'N/A');
      } else {
        doc.text(`${label}:`);
        doc.font('Helvetica').fontSize(9.5).fillColor('#555555').text(value || 'N/A');
      }
    };

    const twoCol = (items) => {
      const colWidth = (doc.page.width - 120) / 2;
      items.forEach((pair, i) => {
        const isLeft = i % 2 === 0;
        if (isLeft && i < items.length) {
          const startY = doc.y;
          const leftX = 60;
          const rightX = 60 + colWidth + 20;

          // Left item
          doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#333333');
          doc.text(`${pair[0]}: `, leftX, startY, { continued: true, width: colWidth });
          doc.font('Helvetica').fontSize(9.5).fillColor('#555555').text(pair[1] || 'N/A', {
            width: colWidth,
          });

          const rowHeight = doc.y - startY;

          // Right item (if exists)
          if (i + 1 < items.length) {
            const nextPair = items[i + 1];
            doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#333333');
            doc.text(`${nextPair[0]}: `, rightX, startY, { continued: true, width: colWidth });
            doc
              .font('Helvetica')
              .fontSize(9.5)
              .fillColor('#555555')
              .text(nextPair[1] || 'N/A', { width: colWidth });
          }

          doc.moveDown(0.15);
        }
      });
    };

    // ── SECTION 1: CUSTOMER INFORMATION ─────────────────────────────────────
    sectionTitle('1. Customer Information');
    labelValue(
      'Full Name',
      `${rental.first_name} ${rental.last_name}`
    );
    labelValue('Email', rental.customer_email);
    labelValue('Phone', rental.customer_phone);
    if (rental.address || rental.city) {
      labelValue('Address', [rental.address, rental.city].filter(Boolean).join(', '));
    }

    // ── SECTION 2: MEASUREMENTS ─────────────────────────────────────────────
    sectionTitle('2. Customer Measurements');
    twoCol([
      ['Bust', rental.bust_cm ? `${rental.bust_cm} cm` : null],
      ['Waist', rental.waist_cm ? `${rental.waist_cm} cm` : null],
      ['Hips', rental.hips_cm ? `${rental.hips_cm} cm` : null],
      ['Hollow to Hem', rental.hollow_to_hem_cm ? `${rental.hollow_to_hem_cm} cm` : null],
      ['Height', rental.height_cm ? `${rental.height_cm} cm` : null],
      ['Shoe Size', rental.shoe_size],
    ]);

    // ── SECTION 3: GOWN DETAILS ──────────────────────────────────────────────
    sectionTitle('3. Gown Details');
    labelValue('Gown Name', rental.gown_name);
    twoCol([
      ['SKU / Unit Code', rental.sku],
      ['Designer', rental.designer_name],
      ['Category', rental.category],
      ['Style', rental.style],
      ['Color', rental.gown_color || rental.unit_color],
      ['Fabric', rental.fabric],
      ['Size', rental.size || rental.size_numeric ? `${rental.size || ''} ${rental.size_numeric ? `(${rental.size_numeric})` : ''}`.trim() : null],
    ]);

    // ── SECTION 4: RENTAL PERIOD ─────────────────────────────────────────────
    sectionTitle('4. Rental Period');
    twoCol([
      ['Pickup Date', formatDate(rental.pickup_date)],
      ['Return Date', formatDate(rental.return_date)],
      ['Rental Duration', `${rental.rental_days || 'N/A'} day(s)`],
      ['Status', rental.status],
    ]);

    if (rental.special_requests) {
      doc.moveDown(0.3);
      labelValue('Special Requests', rental.special_requests, false);
    }

    // ── SECTION 5: FINANCIAL BREAKDOWN ──────────────────────────────────────
    sectionTitle('5. Financial Breakdown');

    const tableX = 60;
    const tableWidth = doc.page.width - 120;
    const col2X = tableX + tableWidth - 130;

    const financialRow = (label, amount, bold = false) => {
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(10).fillColor('#333333');
      doc.text(label, tableX, doc.y, { continued: false, width: tableWidth - 130 });
      const rowY = doc.y - doc.currentLineHeight();
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(10).fillColor('#333333');
      doc.text(amount, col2X, rowY, { width: 120, align: 'right' });
    };

    financialRow(
      `Daily Rate × ${rental.rental_days || 0} days`,
      `${formatCurrency(rental.daily_rate)} × ${rental.rental_days || 0}`
    );
    financialRow('Subtotal', formatCurrency(rental.subtotal));

    if (parseFloat(rental.discount_amount) > 0) {
      financialRow('Discount', `-${formatCurrency(rental.discount_amount)}`);
    }

    financialRow('Security Deposit (Refundable)', formatCurrency(rental.security_deposit));

    doc
      .moveTo(col2X - 10, doc.y)
      .lineTo(doc.page.width - 60, doc.y)
      .strokeColor('#C9A84C')
      .lineWidth(0.8)
      .stroke();
    doc.moveDown(0.2);

    financialRow('TOTAL AMOUNT DUE', formatCurrency(rental.total_amount), true);
    financialRow('Amount Paid', formatCurrency(rental.amount_paid));

    const balance = parseFloat(rental.total_amount || 0) - parseFloat(rental.amount_paid || 0);
    financialRow('Balance Due', formatCurrency(balance), balance > 0);

    // ── SECTION 6: TERMS & CONDITIONS ────────────────────────────────────────
    sectionTitle('6. Terms & Conditions');

    const terms = [
      '1. DAMAGE & LIABILITY: The client accepts full financial responsibility for any damage to the rental gown beyond normal wear. Damage assessment will be conducted upon return, and repair or replacement costs will be deducted from the security deposit or charged additionally.',

      '2. CLEANING: All gowns must be returned in the same general cleanliness as when received. Post-rental professional dry-cleaning is included in the rental fee. Any additional staining or soiling beyond normal use may incur additional cleaning charges.',

      '3. LATE RETURNS: Gowns not returned by the agreed return date will incur a late fee of the daily rental rate per additional day. The client must notify FARYAL AL HOSARY at least 24 hours in advance for any extension requests, subject to availability.',

      '4. ALTERATIONS: No permanent alterations are permitted to the rental gown without prior written consent from FARYAL AL HOSARY. Temporary alterations (e.g., hemming, pinning) must be reversed before return. Unauthorized permanent alterations will result in replacement cost charges.',

      '5. CANCELLATION POLICY: Cancellations made more than 14 days before the pickup date will receive a full refund minus the booking deposit. Cancellations within 7–14 days will forfeit 50% of the rental fee. Cancellations within 7 days or no-shows will forfeit 100% of the rental fee. Security deposits are fully refundable upon cancellation.',
    ];

    terms.forEach((term) => {
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor('#444444')
        .text(term, { align: 'justify', lineGap: 1.5 });
      doc.moveDown(0.5);
    });

    // ── SECTION 7: SIGNATURES ─────────────────────────────────────────────────
    doc.moveDown(1);

    // Check if we need a new page
    if (doc.y > doc.page.height - 180) {
      doc.addPage();
      doc.rect(0, 0, doc.page.width, 8).fill('#C9A84C');
      doc.moveDown(1.5);
    }

    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('#C9A84C')
      .text('SIGNATURES', { characterSpacing: 1 });
    doc
      .moveTo(60, doc.y + 2)
      .lineTo(doc.page.width - 60, doc.y + 2)
      .strokeColor('#e0c97a')
      .lineWidth(0.5)
      .stroke();
    doc.moveDown(0.8);

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#555555')
      .text(
        'By signing below, both parties confirm they have read, understood, and agree to the terms and conditions of this rental agreement.',
        { align: 'justify' }
      );

    doc.moveDown(1.5);

    const sigY = doc.y;
    const halfWidth = (doc.page.width - 120 - 40) / 2;

    // Customer signature block
    doc.font('Helvetica').fontSize(9).fillColor('#333333').text('Customer Signature:', 60, sigY);
    doc
      .moveTo(60, sigY + 40)
      .lineTo(60 + halfWidth, sigY + 40)
      .strokeColor('#333333')
      .lineWidth(0.8)
      .stroke();
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#777777')
      .text(`${rental.first_name} ${rental.last_name}`, 60, sigY + 44);
    doc.font('Helvetica').fontSize(8).fillColor('#777777').text('Date: ________________', 60, sigY + 56);

    // Staff signature block
    const staffX = 60 + halfWidth + 40;
    doc.font('Helvetica').fontSize(9).fillColor('#333333').text('Authorised Staff Signature:', staffX, sigY);
    doc
      .moveTo(staffX, sigY + 40)
      .lineTo(staffX + halfWidth, sigY + 40)
      .strokeColor('#333333')
      .lineWidth(0.8)
      .stroke();
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#777777')
      .text('FARYAL AL HOSARY Representative', staffX, sigY + 44);
    doc.font('Helvetica').fontSize(8).fillColor('#777777').text('Date: ________________', staffX, sigY + 56);

    // ── FOOTER ───────────────────────────────────────────────────────────────
    const footerY = doc.page.height - 50;
    doc
      .moveTo(60, footerY - 10)
      .lineTo(doc.page.width - 60, footerY - 10)
      .strokeColor('#C9A84C')
      .lineWidth(0.8)
      .stroke();

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#999999')
      .text(
        `FARYAL AL HOSARY - Luxury Bridal Couture & Rental  |  Contract: ${rental.rental_code}  |  This document is legally binding.`,
        60,
        footerY,
        { align: 'center', width: doc.page.width - 120 }
      );

    doc.end();

    // Mark contract as generated
    await pool.query(
      'UPDATE rentals SET contract_generated = true WHERE id = $1',
      [rentalId]
    );
  } catch (err) {
    next(err);
  }
});

// POST /api/contracts/:rentalId/sign - Mark contract as signed
router.post('/:rentalId/sign', async (req, res, next) => {
  try {
    const { rentalId } = req.params;
    const { signature_url } = req.body;

    const existing = await pool.query('SELECT id FROM rentals WHERE id = $1', [rentalId]);
    if (!existing.rows[0]) {
      return res.status(404).json({ error: 'Rental not found.' });
    }

    const updateFields = ['contract_signed = true', 'updated_at = NOW()'];
    const params = [];

    if (signature_url) {
      params.push(signature_url);
      updateFields.push(`contract_pdf_url = $${params.length}`);
    }

    params.push(rentalId);

    const result = await pool.query(
      `UPDATE rentals SET ${updateFields.join(', ')} WHERE id = $${params.length} RETURNING id, rental_code, contract_signed, contract_generated`,
      params
    );

    res.json({
      message: 'Contract marked as signed.',
      rental: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

export default router;
