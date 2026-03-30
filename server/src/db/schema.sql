-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'Staff' CHECK (role IN ('Admin', 'Manager', 'Staff')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. designers
CREATE TABLE IF NOT EXISTS designers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  website VARCHAR(255),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. gown_models
CREATE TABLE IF NOT EXISTS gown_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  designer_id UUID REFERENCES designers(id),
  category VARCHAR(50) CHECK (category IN ('Bridal', 'Evening', 'Cocktail', 'Ball Gown', 'Other')),
  style VARCHAR(100),
  color VARCHAR(100),
  fabric VARCHAR(200),
  description TEXT,
  purchase_cost DECIMAL(10,2),
  rental_price_day DECIMAL(10,2) NOT NULL,
  security_deposit DECIMAL(10,2) NOT NULL,
  primary_image_url VARCHAR(500),
  additional_images TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(50),
  bust_cm DECIMAL(5,1),
  waist_cm DECIMAL(5,1),
  hips_cm DECIMAL(5,1),
  hollow_to_hem_cm DECIMAL(5,1),
  height_cm DECIMAL(5,1),
  shoe_size VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. inventory_units
CREATE TABLE IF NOT EXISTS inventory_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  gown_model_id UUID REFERENCES gown_models(id),
  size VARCHAR(20),
  size_numeric DECIMAL(4,1),
  status VARCHAR(20) DEFAULT 'Available' CHECK (status IN ('Available', 'Reserved', 'Rented', 'Cleaning', 'Repair', 'Retired')),
  condition_notes TEXT,
  condition_rating INTEGER CHECK (condition_rating BETWEEN 1 AND 10),
  date_acquired DATE,
  purchase_price DECIMAL(10,2),
  storage_location VARCHAR(100),
  condition_photos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. rentals
CREATE TABLE IF NOT EXISTS rentals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rental_code VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  inventory_unit_id UUID REFERENCES inventory_units(id),
  pickup_date DATE NOT NULL,
  return_date DATE NOT NULL,
  actual_return_date DATE,
  rental_days INTEGER,
  daily_rate DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2),
  security_deposit DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2),
  amount_paid DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'Inquiry' CHECK (status IN ('Inquiry', 'Reserved', 'Confirmed', 'Out', 'Returned', 'Complete', 'Cancelled')),
  contract_generated BOOLEAN DEFAULT false,
  contract_signed BOOLEAN DEFAULT false,
  contract_pdf_url VARCHAR(500),
  special_requests TEXT,
  staff_notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. rental_status_history
CREATE TABLE IF NOT EXISTS rental_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rental_id UUID REFERENCES rentals(id) ON DELETE CASCADE,
  previous_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- 8. maintenance_logs
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_unit_id UUID REFERENCES inventory_units(id),
  rental_id UUID REFERENCES rentals(id),
  maintenance_type VARCHAR(50) CHECK (maintenance_type IN ('Cleaning', 'Repair', 'Inspection', 'Alteration')),
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  cost DECIMAL(10,2),
  performed_by VARCHAR(200),
  before_photos TEXT[],
  after_photos TEXT[],
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Complete')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rental_id UUID REFERENCES rentals(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_type VARCHAR(30) CHECK (payment_type IN ('Deposit', 'Rental Fee', 'Security Deposit', 'Refund', 'Penalty')),
  payment_method VARCHAR(30) CHECK (payment_method IN ('Cash', 'Credit Card', 'Bank Transfer', 'Check', 'Other')),
  transaction_reference VARCHAR(200),
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- FUNCTION: Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- FUNCTION: Check unit availability
CREATE OR REPLACE FUNCTION check_unit_availability(
  p_unit_id UUID,
  p_from_date DATE,
  p_to_date DATE,
  p_exclude_rental_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO conflict_count
  FROM rentals
  WHERE inventory_unit_id = p_unit_id
    AND status NOT IN ('Cancelled', 'Complete')
    AND (p_exclude_rental_id IS NULL OR id != p_exclude_rental_id)
    AND pickup_date <= p_to_date
    AND return_date >= p_from_date;
  RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql;

-- FUNCTION: Log rental status changes
CREATE OR REPLACE FUNCTION log_rental_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO rental_status_history (rental_id, previous_status, new_status, notes)
    VALUES (NEW.id, OLD.status, NEW.status, 'Auto-logged by trigger');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- FUNCTION: Auto-create maintenance after return
CREATE OR REPLACE FUNCTION create_maintenance_after_return()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != 'Returned' AND NEW.status = 'Returned' THEN
    INSERT INTO maintenance_logs (
      inventory_unit_id,
      rental_id,
      maintenance_type,
      start_date,
      end_date,
      description,
      status
    )
    VALUES (
      NEW.inventory_unit_id,
      NEW.id,
      'Cleaning',
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '3 days',
      'Post-rental cleaning and inspection',
      'Pending'
    );
    UPDATE inventory_units SET status = 'Cleaning' WHERE id = NEW.inventory_unit_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_gown_models_updated_at') THEN
    CREATE TRIGGER update_gown_models_updated_at
      BEFORE UPDATE ON gown_models
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_customers_updated_at') THEN
    CREATE TRIGGER update_customers_updated_at
      BEFORE UPDATE ON customers
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_inventory_units_updated_at') THEN
    CREATE TRIGGER update_inventory_units_updated_at
      BEFORE UPDATE ON inventory_units
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_rentals_updated_at') THEN
    CREATE TRIGGER update_rentals_updated_at
      BEFORE UPDATE ON rentals
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'log_rental_status_changes') THEN
    CREATE TRIGGER log_rental_status_changes
      AFTER UPDATE ON rentals
      FOR EACH ROW EXECUTE FUNCTION log_rental_status_change();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'maintenance_after_return') THEN
    CREATE TRIGGER maintenance_after_return
      AFTER UPDATE ON rentals
      FOR EACH ROW EXECUTE FUNCTION create_maintenance_after_return();
  END IF;
END;
$$;

-- VIEWS
CREATE OR REPLACE VIEW available_inventory AS
SELECT
  iu.*,
  gm.name AS gown_name,
  gm.category,
  gm.rental_price_day,
  d.name AS designer_name
FROM inventory_units iu
JOIN gown_models gm ON iu.gown_model_id = gm.id
LEFT JOIN designers d ON gm.designer_id = d.id
WHERE iu.status = 'Available';

CREATE OR REPLACE VIEW todays_pickups AS
SELECT
  r.*,
  c.first_name,
  c.last_name,
  c.phone,
  iu.sku,
  gm.name AS gown_name
FROM rentals r
JOIN customers c ON r.customer_id = c.id
JOIN inventory_units iu ON r.inventory_unit_id = iu.id
JOIN gown_models gm ON iu.gown_model_id = gm.id
WHERE r.pickup_date = CURRENT_DATE AND r.status IN ('Confirmed', 'Reserved');

CREATE OR REPLACE VIEW todays_returns AS
SELECT
  r.*,
  c.first_name,
  c.last_name,
  c.phone,
  iu.sku,
  gm.name AS gown_name
FROM rentals r
JOIN customers c ON r.customer_id = c.id
JOIN inventory_units iu ON r.inventory_unit_id = iu.id
JOIN gown_models gm ON iu.gown_model_id = gm.id
WHERE r.return_date = CURRENT_DATE AND r.status = 'Out';

CREATE OR REPLACE VIEW monthly_revenue AS
SELECT
  DATE_TRUNC('month', created_at) AS month,
  COUNT(*) AS rental_count,
  SUM(total_amount) AS total_revenue,
  SUM(amount_paid) AS collected_revenue
FROM rentals
WHERE status NOT IN ('Cancelled', 'Inquiry')
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Seed default admin user (password: Admin@123)
INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES (
  'admin@faryalalhosary.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Admin',
  'User',
  'Admin'
)
ON CONFLICT (email) DO NOTHING;
