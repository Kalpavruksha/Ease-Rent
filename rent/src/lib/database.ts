import { useState, useEffect } from 'react';
import { createDbWorker } from "@sqlite.org/sqlite-wasm";

let db: any = null;
let isInitialized = false;

export const initDatabase = async () => {
  if (isInitialized) return;

  try {
    const worker = await createDbWorker(
      ["/sqlite3.wasm"],
      "/sqlite-wasm-3450200/sqlite-wasm.js",
      "/sqlite-wasm-3450200/sqlite-wasm-3450200.js"
    );

    db = await worker.db;

    // Create tables
    await db.exec(`
      CREATE TABLE IF NOT EXISTS properties (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        description TEXT,
        monthly_rent DECIMAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'available',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tenants (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        emergency_contact TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS leases (
        id TEXT PRIMARY KEY,
        property_id TEXT REFERENCES properties(id),
        tenant_id TEXT REFERENCES tenants(id),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        rent_amount DECIMAL NOT NULL,
        security_deposit DECIMAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        document_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        lease_id TEXT REFERENCES leases(id),
        amount DECIMAL NOT NULL,
        payment_date DATE NOT NULL,
        payment_method TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        tenant_id TEXT REFERENCES tenants(id),
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert sample data if tables are empty
    const propertiesCount = await db.exec({
      sql: 'SELECT COUNT(*) as count FROM properties',
      returnValue: 'resultRows'
    });

    if (propertiesCount[0].count === 0) {
      await db.exec(`
        INSERT INTO properties (id, name, address, monthly_rent, status) VALUES
        ('prop1', 'House 1', '123 Main St', 11000, 'occupied'),
        ('prop2', 'House 2', '456 Oak St', 11000, 'available'),
        ('prop3', 'House 3', '789 Pine St', 11000, 'available');

        INSERT INTO tenants (id, first_name, last_name, phone, email) VALUES
        ('tenant1', 'Chiragudi', 'Bhushanam', '+918088252231', 'tenant@placeholder.com');

        INSERT INTO leases (
          id, property_id, tenant_id, start_date, end_date, rent_amount, security_deposit, status
        ) VALUES (
          'lease1', 'prop1', 'tenant1', '2025-02-02', '2026-02-02', 11000, 50000, 'active'
        );

        INSERT INTO payments (
          id, lease_id, amount, payment_date, payment_method, status
        ) VALUES (
          'payment1', 'lease1', 11000, '2025-02-02', 'cash', 'completed'
        );
      `);
    }

    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

export const dbOperations = {
  // Properties
  getAllProperties: async () => {
    const result = await db.exec({
      sql: 'SELECT * FROM properties ORDER BY created_at DESC',
      returnValue: 'resultRows'
    });
    return result;
  },

  // Tenants
  getAllTenants: async () => {
    const result = await db.exec({
      sql: 'SELECT * FROM tenants ORDER BY created_at DESC',
      returnValue: 'resultRows'
    });
    return result;
  },

  // Payments
  getAllPayments: async () => {
    const result = await db.exec({
      sql: `
        SELECT 
          p.*,
          t.first_name,
          t.last_name,
          pr.name as property_name
        FROM payments p
        JOIN leases l ON p.lease_id = l.id
        JOIN tenants t ON l.tenant_id = t.id
        JOIN properties pr ON l.property_id = pr.id
        ORDER BY p.payment_date DESC
      `,
      returnValue: 'resultRows'
    });
    return result;
  }
};

// Custom hook for database operations
export const useDatabase = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initDatabase().then(() => setIsReady(true));
  }, []);

  return {
    isReady,
    operations: dbOperations
  };
};

export default dbOperations;