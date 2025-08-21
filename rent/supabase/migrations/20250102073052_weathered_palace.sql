/*
  # Add initial property and tenant data
  
  1. Data Addition
    - Add three properties
    - Add tenant Chiragudi Bhushanam
    - Add lease information with ₹50,000 deposit
    - Add initial payment record of ₹11,000
*/

-- Insert Properties
INSERT INTO properties (id, name, address, monthly_rent, status) VALUES
  (uuid_generate_v4(), 'House 1', '123 Main St', 11000, 'occupied'),
  (uuid_generate_v4(), 'House 2', '456 Oak St', 11000, 'available'),
  (uuid_generate_v4(), 'House 3', '789 Pine St', 11000, 'available');

-- Insert Tenant (with placeholder email)
INSERT INTO tenants (id, first_name, last_name, phone, email) VALUES
  (uuid_generate_v4(), 'Chiragudi', 'Bhushanam', '+918088252231', 'tenant@placeholder.com');

-- Create Lease
WITH tenant_id AS (
  SELECT id FROM tenants WHERE first_name = 'Chiragudi'
),
property_id AS (
  SELECT id FROM properties WHERE status = 'occupied'
)
INSERT INTO leases (
  property_id,
  tenant_id,
  start_date,
  end_date,
  rent_amount,
  security_deposit,
  status
)
SELECT 
  property_id.id,
  tenant_id.id,
  '2025-02-02',
  '2026-02-02',
  11000,
  50000,
  'active'
FROM property_id, tenant_id;

-- Add Initial Payment
WITH lease_id AS (
  SELECT id FROM leases WHERE start_date = '2025-02-02'
)
INSERT INTO payments (
  lease_id,
  amount,
  payment_date,
  payment_method,
  status
)
SELECT 
  lease_id.id,
  11000,
  '2025-02-02',
  'cash',
  'completed'
FROM lease_id;