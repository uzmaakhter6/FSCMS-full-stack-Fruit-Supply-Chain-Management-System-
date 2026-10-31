import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../fscms.db');
export const db = new Database(dbPath);

// Enable foreign keys and WAL mode for high concurrency
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Initialize Relational Schema
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      role_id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_name TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT NOT NULL,
      phone TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      supplier_id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      supplier_type TEXT NOT NULL,
      sourcing_region TEXT,
      country TEXT NOT NULL,
      contact_person TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      payment_terms_days INTEGER NOT NULL DEFAULT 30,
      credit_limit REAL NOT NULL DEFAULT 50000.00,
      rating REAL NOT NULL DEFAULT 5.0,
      quality_score REAL NOT NULL DEFAULT 98.0,
      active_orders_count INTEGER NOT NULL DEFAULT 0,
      outstanding_balance REAL NOT NULL DEFAULT 0.00,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS fruit_categories (
      category_id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS fruit_products (
      product_id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      variety TEXT NOT NULL,
      grade TEXT NOT NULL DEFAULT 'Export Grade A+',
      origin_country TEXT NOT NULL,
      harvest_season TEXT NOT NULL,
      unit TEXT NOT NULL DEFAULT 'carton',
      purchase_price REAL NOT NULL,
      wholesale_price REAL NOT NULL,
      retail_price REAL NOT NULL,
      storage_temp_min REAL NOT NULL DEFAULT 2.0,
      storage_temp_max REAL NOT NULL DEFAULT 6.0,
      expected_shelf_life_days INTEGER NOT NULL DEFAULT 14,
      min_stock_level INTEGER NOT NULL DEFAULT 200,
      current_stock INTEGER NOT NULL DEFAULT 0,
      image_url TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS warehouses (
      warehouse_id INTEGER PRIMARY KEY AUTOINCREMENT,
      warehouse_code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      warehouse_type TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      capacity_metric_tons REAL NOT NULL,
      current_occupancy_metric_tons REAL NOT NULL DEFAULT 0.0,
      target_temp_celsius REAL NOT NULL,
      current_temp_celsius REAL NOT NULL,
      current_humidity_percent REAL NOT NULL DEFAULT 90.0,
      status TEXT NOT NULL DEFAULT 'OPTIMAL',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS warehouse_zones (
      zone_id INTEGER PRIMARY KEY AUTOINCREMENT,
      warehouse_id INTEGER NOT NULL,
      zone_name TEXT NOT NULL,
      target_temp REAL NOT NULL,
      target_humidity REAL NOT NULL,
      capacity_units INTEGER NOT NULL,
      FOREIGN KEY (warehouse_id) REFERENCES warehouses (warehouse_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS purchase_orders (
      po_id INTEGER PRIMARY KEY AUTOINCREMENT,
      po_number TEXT NOT NULL UNIQUE,
      supplier_id INTEGER NOT NULL,
      warehouse_id INTEGER NOT NULL,
      order_date TEXT NOT NULL,
      expected_delivery_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
      subtotal REAL NOT NULL DEFAULT 0.00,
      tax REAL NOT NULL DEFAULT 0.00,
      grand_total REAL NOT NULL DEFAULT 0.00,
      approved_by TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers (supplier_id) ON DELETE RESTRICT,
      FOREIGN KEY (warehouse_id) REFERENCES warehouses (warehouse_id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS purchase_order_items (
      po_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity_ordered REAL NOT NULL,
      quantity_received REAL NOT NULL DEFAULT 0.0,
      unit TEXT NOT NULL,
      unit_price REAL NOT NULL,
      total_cost REAL NOT NULL,
      FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders (po_id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES fruit_products (product_id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS inventory_batches (
      batch_id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_number TEXT NOT NULL UNIQUE,
      product_id INTEGER NOT NULL,
      supplier_id INTEGER NOT NULL,
      purchase_order_id INTEGER,
      warehouse_id INTEGER NOT NULL,
      zone TEXT NOT NULL DEFAULT 'Zone B - Standard Cold',
      harvest_date TEXT,
      received_date TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      days_to_expiry INTEGER NOT NULL,
      initial_quantity REAL NOT NULL,
      quantity_available REAL NOT NULL,
      quantity_reserved REAL NOT NULL DEFAULT 0.0,
      quantity_damaged REAL NOT NULL DEFAULT 0.0,
      unit TEXT NOT NULL,
      purchase_cost REAL NOT NULL,
      qc_status TEXT NOT NULL DEFAULT 'PASSED',
      grade TEXT NOT NULL DEFAULT 'Export Grade A+',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES fruit_products (product_id) ON DELETE RESTRICT,
      FOREIGN KEY (supplier_id) REFERENCES suppliers (supplier_id) ON DELETE RESTRICT,
      FOREIGN KEY (warehouse_id) REFERENCES warehouses (warehouse_id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS inventory_movements (
      movement_id INTEGER PRIMARY KEY AUTOINCREMENT,
      movement_code TEXT NOT NULL UNIQUE,
      batch_number TEXT NOT NULL,
      product_name TEXT NOT NULL,
      movement_type TEXT NOT NULL,
      quantity_delta REAL NOT NULL,
      unit TEXT NOT NULL,
      source_location TEXT NOT NULL,
      dest_location TEXT NOT NULL,
      performed_by TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS customers (
      customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_code TEXT NOT NULL UNIQUE,
      business_name TEXT NOT NULL,
      contact_person TEXT NOT NULL,
      category TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      credit_limit REAL NOT NULL DEFAULT 100000.00,
      current_balance REAL NOT NULL DEFAULT 0.00,
      discount_rate REAL NOT NULL DEFAULT 0.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sales_orders (
      sales_order_id INTEGER PRIMARY KEY AUTOINCREMENT,
      so_number TEXT NOT NULL UNIQUE,
      customer_id INTEGER NOT NULL,
      order_date TEXT NOT NULL,
      dispatch_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'CONFIRMED',
      subtotal REAL NOT NULL DEFAULT 0.00,
      discount REAL NOT NULL DEFAULT 0.00,
      tax REAL NOT NULL DEFAULT 0.00,
      grand_total REAL NOT NULL DEFAULT 0.00,
      payment_status TEXT NOT NULL DEFAULT 'UNPAID',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers (customer_id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS sales_order_items (
      so_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      sales_order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity_ordered REAL NOT NULL,
      quantity_allocated REAL NOT NULL DEFAULT 0.0,
      unit TEXT NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      FOREIGN KEY (sales_order_id) REFERENCES sales_orders (sales_order_id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES fruit_products (product_id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS sales_order_allocations (
      allocation_id INTEGER PRIMARY KEY AUTOINCREMENT,
      so_item_id INTEGER NOT NULL,
      batch_number TEXT NOT NULL,
      allocated_quantity REAL NOT NULL,
      expiry_date TEXT NOT NULL,
      FOREIGN KEY (so_item_id) REFERENCES sales_order_items (so_item_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quality_inspections (
      inspection_id INTEGER PRIMARY KEY AUTOINCREMENT,
      inspection_code TEXT NOT NULL UNIQUE,
      batch_number TEXT NOT NULL,
      product_name TEXT NOT NULL,
      inspector_name TEXT NOT NULL,
      brix_sweetness REAL NOT NULL,
      firmness_kgf REAL NOT NULL,
      defect_percentage REAL NOT NULL,
      verdict TEXT NOT NULL,
      inspection_date TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS spoilage_records (
      spoilage_id INTEGER PRIMARY KEY AUTOINCREMENT,
      spoilage_code TEXT NOT NULL UNIQUE,
      batch_number TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity_spoiled REAL NOT NULL,
      unit TEXT NOT NULL,
      total_received REAL NOT NULL,
      spoilage_percentage REAL NOT NULL,
      financial_loss REAL NOT NULL,
      reason TEXT NOT NULL,
      action_taken TEXT NOT NULL,
      recorded_by TEXT NOT NULL,
      record_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS shipments (
      shipment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      shipment_number TEXT NOT NULL UNIQUE,
      so_number TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      vehicle_plate TEXT NOT NULL,
      driver_name TEXT NOT NULL,
      driver_phone TEXT NOT NULL,
      route TEXT NOT NULL,
      departure_time TEXT NOT NULL,
      estimated_arrival TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'IN_TRANSIT',
      current_temp_celsius REAL NOT NULL,
      setpoint_temp_celsius REAL NOT NULL,
      transport_cost REAL NOT NULL DEFAULT 0.00,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS expenses (
      expense_id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      warehouse_name TEXT NOT NULL,
      amount REAL NOT NULL,
      expense_date TEXT NOT NULL,
      payee TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create Indexes for FEFO, Batches, and High-Throughput Queries
    CREATE INDEX IF NOT EXISTS idx_batches_fefo ON inventory_batches (product_id, expiry_date, quantity_available);
    CREATE INDEX IF NOT EXISTS idx_batches_expiry ON inventory_batches (expiry_date ASC);
    CREATE INDEX IF NOT EXISTS idx_movements_batch ON inventory_movements (batch_number, timestamp);
    CREATE INDEX IF NOT EXISTS idx_po_status ON purchase_orders (status, order_date);
    CREATE INDEX IF NOT EXISTS idx_so_status ON sales_orders (status, order_date);
  `);

  // Check if seed needed
  const productCount = db.prepare('SELECT COUNT(*) as count FROM fruit_products').get() as { count: number };
  if (productCount.count === 0) {
    seedDatabase();
  }
}

function seedDatabase() {
  const seedFruits = [
    { sku: 'FRT-MNG-ALPH', name: 'Alphonso Mangoes', category: 'Tropical', variety: 'Alphonso Ratnagiri', grade: 'Export Grade A+', origin: 'India', season: 'March - June', unit: 'crate', cost: 28.50, wholesale: 42.00, retail: 55.00, tMin: 10.0, tMax: 13.0, shelf: 14, minStock: 250, stock: 680, img: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=300&q=80' },
    { sku: 'FRT-BAN-CAV', name: 'Cavendish Bananas', category: 'Tropical', variety: 'Grand Nain / Cavendish', grade: 'Grade A', origin: 'Ecuador', season: 'Year-Round', unit: 'carton', cost: 9.20, wholesale: 14.50, retail: 19.90, tMin: 13.0, tMax: 14.5, shelf: 18, minStock: 500, stock: 2150, img: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=300&q=80' },
    { sku: 'FRT-APP-HONEY', name: 'Honeycrisp Apples', category: 'Pomes', variety: 'Honeycrisp Premium Red', grade: 'Export Grade A+', origin: 'USA (Washington)', season: 'September - February', unit: 'carton', cost: 18.00, wholesale: 26.50, retail: 36.00, tMin: 0.5, tMax: 2.0, shelf: 60, minStock: 300, stock: 1420, img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=300&q=80' },
    { sku: 'FRT-ORA-VAL', name: 'Valencia Oranges', category: 'Citrus', variety: 'Valencia Late', grade: 'Grade A', origin: 'Spain', season: 'March - October', unit: 'carton', cost: 12.00, wholesale: 18.00, retail: 24.50, tMin: 3.0, tMax: 6.0, shelf: 45, minStock: 400, stock: 1850, img: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=300&q=80' },
    { sku: 'FRT-GRP-THOMP', name: 'Thompson Seedless Grapes', category: 'Citrus', variety: 'Thompson Green', grade: 'Export Grade A+', origin: 'Chile', season: 'November - April', unit: 'carton', cost: 16.50, wholesale: 25.00, retail: 34.00, tMin: -0.5, tMax: 1.0, shelf: 28, minStock: 250, stock: 940, img: 'https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=300&q=80' },
    { sku: 'FRT-STR-CHAND', name: 'Chandler Strawberries', category: 'Berries', variety: 'Chandler Sweet', grade: 'Export Grade A+', origin: 'Mexico', season: 'January - May', unit: 'punnet', cost: 1.80, wholesale: 2.90, retail: 4.50, tMin: 0.0, tMax: 2.0, shelf: 7, minStock: 600, stock: 480, img: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=300&q=80' },
    { sku: 'FRT-WAT-SUGAR', name: 'Sugar Baby Watermelons', category: 'Melons', variety: 'Sugar Baby Seedless', grade: 'Grade A', origin: 'Morocco', season: 'May - August', unit: 'kg', cost: 0.45, wholesale: 0.85, retail: 1.30, tMin: 10.0, tMax: 12.0, shelf: 21, minStock: 2000, stock: 6400, img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=300&q=80' },
    { sku: 'FRT-POM-WOND', name: 'Wonderful Pomegranates', category: 'Citrus', variety: 'Wonderful Deep Crimson', grade: 'Export Grade A+', origin: 'Turkey', season: 'September - January', unit: 'carton', cost: 21.00, wholesale: 31.00, retail: 42.00, tMin: 5.0, tMax: 7.0, shelf: 40, minStock: 150, stock: 520, img: 'https://images.unsplash.com/photo-1541344999736-83eca872f240?auto=format&fit=crop&w=300&q=80' },
    { sku: 'FRT-DAT-MEDJ', name: 'Premium Medjool Dates', category: 'Tropical', variety: 'Medjool Jumbo', grade: 'Export Grade A+', origin: 'Jordan Valley', season: 'October - December', unit: 'carton', cost: 45.00, wholesale: 65.00, retail: 89.00, tMin: 0.0, tMax: 4.0, shelf: 180, minStock: 100, stock: 410, img: 'https://images.unsplash.com/photo-1594951493925-19b6d4438322?auto=format&fit=crop&w=300&q=80' },
    { sku: 'FRT-AVO-HASS', name: 'Hass Avocados', category: 'Tropical', variety: 'Hass Organic', grade: 'Export Grade A+', origin: 'Peru', season: 'May - September', unit: 'carton', cost: 22.00, wholesale: 34.00, retail: 48.00, tMin: 4.0, tMax: 6.0, shelf: 16, minStock: 350, stock: 1100, img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=300&q=80' },
    { sku: 'FRT-KIW-HAYW', name: 'Hayward Green Kiwis', category: 'Tropical', variety: 'Hayward Sweet Green', grade: 'Grade A', origin: 'New Zealand', season: 'May - November', unit: 'carton', cost: 17.50, wholesale: 27.00, retail: 37.50, tMin: 0.0, tMax: 1.0, shelf: 50, minStock: 200, stock: 780, img: 'https://images.unsplash.com/photo-1585059895524-72359e06133a?auto=format&fit=crop&w=300&q=80' },
    { sku: 'FRT-PIN-MD2', name: 'MD2 Extra Sweet Pineapples', category: 'Tropical', variety: 'MD2 Golden Ripe', grade: 'Grade A', origin: 'Costa Rica', season: 'Year-Round', unit: 'crate', cost: 14.00, wholesale: 22.50, retail: 31.00, tMin: 7.0, tMax: 10.0, shelf: 20, minStock: 200, stock: 640, img: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=300&q=80' },
    { sku: 'FRT-PCH-ELB', name: 'Elberta Yellow Peaches', category: 'Pomes', variety: 'Elberta Freestone', grade: 'Grade A', origin: 'Italy', season: 'June - September', unit: 'carton', cost: 15.00, wholesale: 23.50, retail: 33.00, tMin: 0.0, tMax: 2.0, shelf: 12, minStock: 180, stock: 520, img: 'https://images.unsplash.com/photo-1595156784534-c288d6b9d62d?auto=format&fit=crop&w=300&q=80' },
    { sku: 'FRT-GUA-ALH', name: 'Safeda Guavas', category: 'Tropical', variety: 'Allahabad Safeda', grade: 'Grade A', origin: 'Egypt', season: 'November - March', unit: 'crate', cost: 11.50, wholesale: 18.00, retail: 25.00, tMin: 8.0, tMax: 10.0, shelf: 10, minStock: 120, stock: 340, img: 'https://images.unsplash.com/photo-1536511135899-4a949e29a98e?auto=format&fit=crop&w=300&q=80' },
    { sku: 'FRT-PAP-REDL', name: 'Red Lady Papayas', category: 'Tropical', variety: 'Red Lady Solo F1', grade: 'Grade A', origin: 'Brazil', season: 'Year-Round', unit: 'crate', cost: 13.00, wholesale: 21.00, retail: 29.50, tMin: 10.0, tMax: 12.0, shelf: 14, minStock: 150, stock: 410, img: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=300&q=80' }
  ];

  const insertFruit = db.prepare(`
    INSERT INTO fruit_products (sku, name, category, variety, grade, origin_country, harvest_season, unit, purchase_price, wholesale_price, retail_price, storage_temp_min, storage_temp_max, expected_shelf_life_days, min_stock_level, current_stock, image_url)
    VALUES (@sku, @name, @category, @variety, @grade, @origin, @season, @unit, @cost, @wholesale, @retail, @tMin, @tMax, @shelf, @minStock, @stock, @img)
  `);

  const insertAllFruits = db.transaction((fruits) => {
    for (const f of fruits) insertFruit.run(f);
  });
  insertAllFruits(seedFruits);

  // Seed Suppliers
  const seedSuppliers = [
    { code: 'SUP-AGRO-IND', name: 'Konkan Orchards Export Co.', type: 'Cooperative', region: 'Ratnagiri & Devgad Belt', country: 'India', person: 'Rajesh V. Patil', email: 'patil@konkanorchards.in', phone: '+91-235-228-4411', terms: 30, rating: 4.9, score: 98.5, balance: 14250.00 },
    { code: 'SUP-VAL-CITR', name: 'Sol de Valencia Citrus S.L.', type: 'Commercial Grower', region: 'Levante Coastal Basin', country: 'Spain', person: 'Mateo Morales', email: 'm.morales@solvalencia.es', phone: '+34-963-882-190', terms: 30, rating: 4.8, score: 96.8, balance: 8400.00 },
    { code: 'SUP-ECU-BAN', name: 'Guayas River Banana Growers', type: 'Commercial Grower', region: 'Guayas River Delta', country: 'Ecuador', person: 'Carlos Mendoza', email: 'export@guayasbanana.ec', phone: '+593-42-881-209', terms: 15, rating: 4.7, score: 94.2, balance: 23000.00 },
    { code: 'SUP-PER-AVOC', name: 'Inca Prime Harvest S.A.C.', type: 'Commercial Grower', region: 'Ica Valley Highlands', country: 'Peru', person: 'Lucia Alvarez', email: 'lalvarez@incaprime.pe', phone: '+51-1-482-9900', terms: 30, rating: 4.95, score: 99.1, balance: 12500.00 },
    { code: 'SUP-MEX-BERR', name: 'Bajio Berry Farms Union', type: 'Cooperative', region: 'Zamora Valley, Michoacan', country: 'Mexico', person: 'Guillermo Fernandez', email: 'info@bajioberry.mx', phone: '+52-351-512-8900', terms: 15, rating: 4.8, score: 95.4, balance: 9800.00 }
  ];

  const insertSupplier = db.prepare(`
    INSERT INTO suppliers (supplier_code, name, supplier_type, sourcing_region, country, contact_person, email, phone, payment_terms_days, rating, quality_score, outstanding_balance)
    VALUES (@code, @name, @type, @region, @country, @person, @email, @phone, @terms, @rating, @score, @balance)
  `);
  db.transaction((sups) => { for (const s of sups) insertSupplier.run(s); })(seedSuppliers);

  // Seed Warehouses
  const seedWarehouses = [
    { code: 'WH-ORD-01', name: 'Chicago Central Cold Hub', type: 'Cold Storage', city: 'Chicago, IL', country: 'USA', cap: 3500.0, occ: 2140.0, targetT: 2.5, currT: 2.3, hum: 89.2, status: 'OPTIMAL' },
    { code: 'WH-LAX-02', name: 'Long Beach Marine Cold Terminal', type: 'Controlled Atmosphere', city: 'Long Beach, CA', country: 'USA', cap: 5000.0, occ: 3820.0, targetT: 4.0, currT: 3.8, hum: 87.5, status: 'OPTIMAL' },
    { code: 'WH-ROT-03', name: 'Rotterdam Agro-Port Logistics', type: 'Distribution Center', city: 'Rotterdam', country: 'Netherlands', cap: 8000.0, occ: 5290.0, targetT: 3.0, currT: 5.1, hum: 91.0, status: 'WARNING' }
  ];

  const insertWh = db.prepare(`
    INSERT INTO warehouses (warehouse_code, name, warehouse_type, city, country, capacity_metric_tons, current_occupancy_metric_tons, target_temp_celsius, current_temp_celsius, current_humidity_percent, status)
    VALUES (@code, @name, @type, @city, @country, @cap, @occ, @targetT, @currT, @hum, @status)
  `);
  db.transaction((whs) => { for (const w of whs) insertWh.run(w); })(seedWarehouses);

  // Seed Customers
  const seedCustomers = [
    { code: 'CUST-METRO-01', name: 'Metro Fresh Supermarkets Inc.', person: 'Amanda Richardson', cat: 'Supermarket Chain', email: 'arichardson@metrofresh.com', phone: '+1-312-555-8120', city: 'Chicago, IL', country: 'USA', limit: 250000.0, bal: 48200.0, disc: 5.0 },
    { code: 'CUST-WHOLE-02', name: 'Great Lakes Agro Wholesalers', person: 'Dmitri Rostov', cat: 'Wholesale Buyer', email: 'd.rostov@greatlakesagro.com', phone: '+1-216-555-4491', city: 'Cleveland, OH', country: 'USA', limit: 150000.0, bal: 32150.0, disc: 8.0 },
    { code: 'CUST-EXPO-03', name: 'Nordic Fresh Import AB', person: 'Astrid Lindholm', cat: 'Export Client', email: 'astrid@nordicfresh.se', phone: '+46-8-555-3210', city: 'Rotterdam', country: 'Netherlands', limit: 500000.0, bal: 114500.0, disc: 10.0 }
  ];

  const insertCust = db.prepare(`
    INSERT INTO customers (customer_code, business_name, contact_person, category, email, phone, city, country, credit_limit, current_balance, discount_rate)
    VALUES (@code, @name, @person, @cat, @email, @phone, @city, @country, @limit, @bal, @disc)
  `);
  db.transaction((custs) => { for (const c of custs) insertCust.run(c); })(seedCustomers);

  // Seed Batches (FEFO Engine initial batches)
  const seedBatches = [
    { num: 'BATCH-2026-MNG-001', prodId: 1, supId: 1, whId: 1, zone: 'Zone C - Tropical Room', rec: '2026-10-24', exp: '2026-11-04', days: 4, initQty: 500, availQty: 320, resQty: 100, damQty: 8, unit: 'crate', cost: 28.50 },
    { num: 'BATCH-2026-MNG-002', prodId: 1, supId: 1, whId: 1, zone: 'Zone C - Tropical Room', rec: '2026-10-29', exp: '2026-11-12', days: 12, initQty: 360, availQty: 360, resQty: 0, damQty: 0, unit: 'crate', cost: 28.50 },
    { num: 'BATCH-2026-STR-019', prodId: 6, supId: 5, whId: 1, zone: 'Zone A - Deep Chill', rec: '2026-10-29', exp: '2026-11-02', days: 2, initQty: 600, availQty: 480, resQty: 120, damQty: 15, unit: 'punnet', cost: 1.80 },
    { num: 'BATCH-2026-APP-088', prodId: 3, supId: 4, whId: 1, zone: 'Zone B - Standard Cold', rec: '2026-10-15', exp: '2026-12-15', days: 45, initQty: 1500, availQty: 1420, resQty: 50, damQty: 4, unit: 'carton', cost: 18.00 },
    { num: 'BATCH-2026-BAN-312', prodId: 2, supId: 3, whId: 2, zone: 'Port Inbound Quayside', rec: '2026-10-27', exp: '2026-11-14', days: 14, initQty: 2200, availQty: 2150, resQty: 0, damQty: 12, unit: 'carton', cost: 9.20 },
    { num: 'BATCH-2026-AVO-104', prodId: 10, supId: 4, whId: 2, zone: 'Atmosphere Storage Vault 1', rec: '2026-10-28', exp: '2026-11-13', days: 13, initQty: 1200, availQty: 1100, resQty: 80, damQty: 5, unit: 'carton', cost: 22.00 }
  ];

  const insertBatch = db.prepare(`
    INSERT INTO inventory_batches (batch_number, product_id, supplier_id, warehouse_id, zone, received_date, expiry_date, days_to_expiry, initial_quantity, quantity_available, quantity_reserved, quantity_damaged, unit, purchase_cost)
    VALUES (@num, @prodId, @supId, @whId, @zone, @rec, @exp, @days, @initQty, @availQty, @resQty, @damQty, @unit, @cost)
  `);
  db.transaction((bts) => { for (const b of bts) insertBatch.run(b); })(seedBatches);

  // Seed Movements
  const seedMovements = [
    { code: 'MOV-1001', batch: 'BATCH-2026-MNG-001', prod: 'Alphonso Mangoes', type: 'INBOUND_RECEIPT', delta: 500, unit: 'crate', src: 'Dock Receipt Bay 3', dst: 'Zone C - Tropical Room', user: 'Sarah Jenkins', notes: 'Initial receipt from PO-2026-00101' },
    { code: 'MOV-1002', batch: 'BATCH-2026-MNG-001', prod: 'Alphonso Mangoes', type: 'SPOILAGE_WRITE_OFF', delta: -8, unit: 'crate', src: 'Zone C - Tropical Room', dst: 'Compost Disposal Bay', user: 'Tariq Al-Mansoor', notes: 'QC senescent over-ripe write-off' },
    { code: 'MOV-1003', batch: 'BATCH-2026-APP-088', prod: 'Honeycrisp Apples', type: 'OUTBOUND_SALE', delta: -80, unit: 'carton', src: 'Zone B - Standard Cold', dst: 'Reefer Truck IL-REEF-8921', user: 'Sarah Jenkins', notes: 'Fulfilled for SO-2026-00202' }
  ];

  const insertMov = db.prepare(`
    INSERT INTO inventory_movements (movement_code, batch_number, product_name, movement_type, quantity_delta, unit, source_location, dest_location, performed_by, notes)
    VALUES (@code, @batch, @prod, @type, @delta, @unit, @src, @dst, @user, @notes)
  `);
  db.transaction((movs) => { for (const m of movs) insertMov.run(m); })(seedMovements);

  // Seed POs
  db.exec(`
    INSERT INTO purchase_orders (po_number, supplier_id, warehouse_id, order_date, expected_delivery_date, status, subtotal, tax, grand_total, approved_by, notes)
    VALUES ('PO-2026-00101', 1, 1, '2026-10-18', '2026-10-24', 'FULLY_RECEIVED', 14250.00, 0.00, 14250.00, 'Elena Vance', 'Air-freight consignment direct from Mumbai Int Airport');

    INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity_ordered, quantity_received, unit, unit_price, total_cost)
    VALUES (1, 1, 500, 500, 'crate', 28.50, 14250.00);

    INSERT INTO purchase_orders (po_number, supplier_id, warehouse_id, order_date, expected_delivery_date, status, subtotal, tax, grand_total, approved_by, notes)
    VALUES ('PO-2026-00107', 2, 1, '2026-10-30', '2026-11-06', 'APPROVED', 12000.00, 0.00, 12000.00, 'Marcus Chen', 'Scheduled for dock arrival 2026-11-06');

    INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity_ordered, quantity_received, unit, unit_price, total_cost)
    VALUES (2, 4, 1000, 0, 'carton', 12.00, 12000.00);
  `);

  // Seed Sales Orders & Allocations
  db.exec(`
    INSERT INTO sales_orders (so_number, customer_id, order_date, dispatch_date, status, subtotal, discount, grand_total, payment_status)
    VALUES ('SO-2026-00201', 1, '2026-10-30', '2026-11-01', 'CONFIRMED', 4548.00, 227.40, 4320.60, 'UNPAID');

    INSERT INTO sales_order_items (sales_order_id, product_id, quantity_ordered, quantity_allocated, unit, unit_price, total_price)
    VALUES (1, 1, 100, 100, 'crate', 42.00, 4200.00);

    INSERT INTO sales_order_allocations (so_item_id, batch_number, allocated_quantity, expiry_date)
    VALUES (1, 'BATCH-2026-MNG-001', 100, '2026-11-04');

    INSERT INTO sales_order_items (sales_order_id, product_id, quantity_ordered, quantity_allocated, unit, unit_price, total_price)
    VALUES (1, 6, 120, 120, 'punnet', 2.90, 348.00);

    INSERT INTO sales_order_allocations (so_item_id, batch_number, allocated_quantity, expiry_date)
    VALUES (2, 'BATCH-2026-STR-019', 120, '2026-11-02');
  `);

  // Seed QC & Spoilage
  db.exec(`
    INSERT INTO quality_inspections (inspection_code, batch_number, product_name, inspector_name, brix_sweetness, firmness_kgf, defect_percentage, verdict, inspection_date, notes)
    VALUES ('QC-2026-0091', 'BATCH-2026-MNG-001', 'Alphonso Mangoes', 'Tariq Al-Mansoor', 18.5, 4.8, 1.6, 'PASSED_PREMIUM', '2026-10-24', 'Export standard met, aroma peak.');

    INSERT INTO spoilage_records (spoilage_code, batch_number, product_name, quantity_spoiled, unit, total_received, spoilage_percentage, financial_loss, reason, action_taken, recorded_by, record_date)
    VALUES ('SPL-2026-001', 'BATCH-2026-MNG-001', 'Alphonso Mangoes', 8, 'crate', 500, 1.6, 228.00, 'Over-ripening', 'Composted', 'Tariq Al-Mansoor', '2026-10-27');
  `);

  // Seed Shipments
  db.exec(`
    INSERT INTO shipments (shipment_number, so_number, customer_name, vehicle_plate, driver_name, driver_phone, route, departure_time, estimated_arrival, status, current_temp_celsius, setpoint_temp_celsius, transport_cost)
    VALUES ('SHP-2026-0044', 'SO-2026-00202', 'Great Lakes Agro Wholesalers', 'IL-REEF-8921', 'Robert Kozlowski', '+1-312-555-9012', 'Chicago Hub -> Cleveland Terminal', '2026-10-31 06:30', '2026-10-31 14:00', 'IN_TRANSIT', 1.2, 1.0, 450.00);
  `);

  // Seed Expenses
  db.exec(`
    INSERT INTO expenses (code, category, warehouse_name, amount, expense_date, payee)
    VALUES 
    ('EXP-901', 'Refrigeration Power', 'Chicago Central Cold Hub', 3420.00, '2026-10-28', 'ComEd Commercial Industrial'),
    ('EXP-902', 'Reefer Truck Fuel', 'Chicago Central Cold Hub', 1250.00, '2026-10-29', 'Pilot Flying J Fleet Fuel'),
    ('EXP-903', 'Inspection & Phytosanitary', 'Long Beach Marine Cold Terminal', 890.00, '2026-10-30', 'USDA APHIS Plant Protection');
  `);
}
