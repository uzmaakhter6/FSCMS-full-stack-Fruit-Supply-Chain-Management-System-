import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, initDatabase } from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Database
initDatabase();

// =====================================================================
// REAL RELATIONAL DATABASE REST API ENDPOINTS
// =====================================================================

// 1. Dashboard Metrics (Real SQL Aggregations)
app.get('/api/dashboard/metrics', (_req: Request, res: Response) => {
  try {
    const revenueRow = db.prepare('SELECT COALESCE(SUM(grand_total), 0) as total FROM sales_orders').get() as { total: number };
    const purchasesRow = db.prepare('SELECT COALESCE(SUM(grand_total), 0) as total FROM purchase_orders').get() as { total: number };
    const stockValuationRow = db.prepare('SELECT COALESCE(SUM(quantity_available * purchase_cost), 0) as totalVal, COALESCE(SUM(quantity_available), 0) as totalQty FROM inventory_batches').get() as { totalVal: number; totalQty: number };
    const totalPhysicalStockRow = db.prepare('SELECT COALESCE(SUM(current_stock), 0) as total FROM fruit_products').get() as { total: number };
    
    const expiringBatchesCount = db.prepare(`
      SELECT COUNT(*) as count FROM inventory_batches 
      WHERE expiry_date <= date('now', '+7 days') AND quantity_available > 0
    `).get() as { count: number };

    const lowStockCount = db.prepare(`
      SELECT COUNT(*) as count FROM fruit_products 
      WHERE current_stock <= min_stock_level
    `).get() as { count: number };

    const pendingPOCount = db.prepare(`
      SELECT COUNT(*) as count FROM purchase_orders 
      WHERE status IN ('PENDING_APPROVAL', 'APPROVED')
    `).get() as { count: number };

    const pendingSOCount = db.prepare(`
      SELECT COUNT(*) as count FROM sales_orders 
      WHERE status IN ('CONFIRMED', 'PROCESSING')
    `).get() as { count: number };

    const spoilageStats = db.prepare(`
      SELECT COALESCE(SUM(financial_loss), 0) as totalLoss,
             COALESCE(SUM(quantity_spoiled), 0) as spoiledQty,
             COALESCE(SUM(total_received), 0) as totalRec
      FROM spoilage_records
    `).get() as { totalLoss: number; spoiledQty: number; totalRec: number };

    const expensesTotal = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM expenses').get() as { total: number };
    const whCount = db.prepare('SELECT COUNT(*) as count FROM warehouses').get() as { count: number };
    const supCount = db.prepare('SELECT COUNT(*) as count FROM suppliers').get() as { count: number };

    const spoilagePercentage = spoilageStats.totalRec > 0 
      ? parseFloat(((spoilageStats.spoiledQty / spoilageStats.totalRec) * 100).toFixed(2))
      : 0;

    const grossProfit = revenueRow.total - (purchasesRow.total * 0.45);
    const netProfit = grossProfit - spoilageStats.totalLoss - expensesTotal.total;

    res.json({
      totalRevenue: revenueRow.total,
      totalPurchases: purchasesRow.total,
      grossProfit,
      netProfit,
      currentInventoryValue: stockValuationRow.totalVal,
      totalStockQuantity: totalPhysicalStockRow.total,
      expiringBatchesCount: expiringBatchesCount.count,
      lowStockCount: lowStockCount.count,
      pendingPOCount: pendingPOCount.count,
      pendingSOCount: pendingSOCount.count,
      spoilagePercentage,
      totalSpoilageLoss: spoilageStats.totalLoss,
      activeWarehouses: whCount.count,
      activeSuppliers: supCount.count
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Fruit Products API
app.get('/api/products', (_req: Request, res: Response) => {
  try {
    const products = db.prepare(`
      SELECT 
        product_id as id, sku, name, category, variety, grade, origin_country as originCountry,
        harvest_season as harvestSeason, unit, purchase_price as purchasePrice,
        wholesale_price as wholesalePrice, retail_price as retailPrice,
        storage_temp_min as storageTempMin, storage_temp_max as storageTempMax,
        expected_shelf_life_days as expectedShelfLifeDays, min_stock_level as minStockLevel,
        current_stock as currentStock, image_url as imageUrl, is_active as isActive
      FROM fruit_products 
      ORDER BY product_id ASC
    `).all();
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', (req: Request, res: Response) => {
  try {
    const body = req.body;
    const stmt = db.prepare(`
      INSERT INTO fruit_products (sku, name, category, variety, grade, origin_country, harvest_season, unit, purchase_price, wholesale_price, retail_price, storage_temp_min, storage_temp_max, expected_shelf_life_days, min_stock_level, current_stock, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `);
    const info = stmt.run(
      body.sku.toUpperCase(),
      body.name,
      body.category,
      body.variety || 'Standard Variety',
      body.grade || 'Export Grade A+',
      body.originCountry || 'Domestic',
      body.harvestSeason || 'Seasonal',
      body.unit || 'carton',
      parseFloat(body.purchasePrice) || 10.0,
      parseFloat(body.wholesalePrice) || 15.0,
      parseFloat(body.retailPrice) || 20.0,
      parseFloat(body.storageTempMin) || 2.0,
      parseFloat(body.storageTempMax) || 6.0,
      parseInt(body.expectedShelfLifeDays, 10) || 14,
      parseInt(body.minStockLevel, 10) || 200,
      body.imageUrl || 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=300&q=80'
    );
    res.status(201).json({ id: info.lastInsertRowid, ...body });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Suppliers API
app.get('/api/suppliers', (_req: Request, res: Response) => {
  try {
    const suppliers = db.prepare(`
      SELECT 
        supplier_id as id, supplier_code as code, name, supplier_type as type,
        sourcing_region as sourcingRegion, country, contact_person as contactPerson,
        email, phone, payment_terms_days as paymentTermsDays, rating, quality_score as qualityScore,
        active_orders_count as activeOrdersCount, outstanding_balance as outstandingBalance
      FROM suppliers 
      ORDER BY supplier_id ASC
    `).all();
    res.json(suppliers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/suppliers', (req: Request, res: Response) => {
  try {
    const body = req.body;
    const code = `SUP-${Date.now().toString().slice(-4)}`;
    const stmt = db.prepare(`
      INSERT INTO suppliers (supplier_code, name, supplier_type, sourcing_region, country, contact_person, email, phone, payment_terms_days, rating, quality_score, outstanding_balance)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.0)
    `);
    const info = stmt.run(
      code,
      body.name,
      body.type || 'Commercial Grower',
      body.sourcingRegion || 'Global',
      body.country || 'Global',
      body.contactPerson || '',
      body.email || '',
      body.phone || '',
      parseInt(body.paymentTermsDays, 10) || 30,
      parseFloat(body.rating) || 5.0,
      parseFloat(body.qualityScore) || 98.0
    );
    res.status(201).json({ id: info.lastInsertRowid, code, ...body });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Warehouses API
app.get('/api/warehouses', (_req: Request, res: Response) => {
  try {
    const warehouses = db.prepare(`
      SELECT 
        warehouse_id as id, warehouse_code as code, name, warehouse_type as type,
        city, country, capacity_metric_tons as capacityMetricTons,
        current_occupancy_metric_tons as currentOccupancyMetricTons,
        ROUND((current_occupancy_metric_tons / capacity_metric_tons) * 100, 1) as utilizationRate,
        target_temp_celsius as targetTempCelsius, current_temp_celsius as currentTempCelsius,
        current_humidity_percent as currentHumidityPercent, status
      FROM warehouses
    `).all();
    res.json(warehouses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Inventory Batches (FEFO Order)
app.get('/api/inventory/batches', (_req: Request, res: Response) => {
  try {
    const batches = db.prepare(`
      SELECT 
        b.batch_id as id, b.batch_number as batchNumber, b.product_id as productId,
        f.name as productName, f.sku, b.supplier_id as supplierId, s.name as supplierName,
        b.purchase_order_id as purchaseOrderId, b.warehouse_id as warehouseId,
        w.name as warehouseName, b.zone, b.harvest_date as harvestDate,
        b.received_date as receivedDate, b.expiry_date as expiryDate,
        CAST(ROUND(julianday(b.expiry_date) - julianday('now')) AS INTEGER) as daysToExpiry,
        b.initial_quantity as initialQuantity, b.quantity_available as quantityAvailable,
        b.quantity_reserved as quantityReserved, b.quantity_damaged as quantityDamaged,
        b.unit, b.purchase_cost as purchaseCost, b.qc_status as qcStatus, b.grade
      FROM inventory_batches b
      JOIN fruit_products f ON b.product_id = f.product_id
      JOIN warehouses w ON b.warehouse_id = w.warehouse_id
      JOIN suppliers s ON b.supplier_id = s.supplier_id
      ORDER BY b.expiry_date ASC
    `).all();
    res.json(batches);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/inventory/movements', (_req: Request, res: Response) => {
  try {
    const movements = db.prepare(`
      SELECT 
        movement_code as id, batch_number as batchNumber, product_name as productName,
        movement_type as movementType, quantity_delta as quantityDelta, unit,
        source_location as sourceLocation, dest_location as destLocation,
        performed_by as performedBy, timestamp, notes
      FROM inventory_movements
      ORDER BY movement_id DESC
    `).all();
    res.json(movements);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Transactional Stock Adjustment
app.post('/api/inventory/adjustments', (req: Request, res: Response) => {
  try {
    const { batchId, quantityDelta, reason, notes } = req.body;
    const delta = parseFloat(quantityDelta);

    const executeAdjustment = db.transaction(() => {
      const batch = db.prepare('SELECT * FROM inventory_batches WHERE batch_id = ?').get(batchId) as any;
      if (!batch) throw new Error('Batch not found');
      if (batch.quantity_available + delta < 0) throw new Error('Cannot reduce inventory below zero');

      db.prepare('UPDATE inventory_batches SET quantity_available = quantity_available + ? WHERE batch_id = ?').run(delta, batchId);
      db.prepare('UPDATE fruit_products SET current_stock = current_stock + ? WHERE product_id = ?').run(delta, batch.product_id);

      const wh = db.prepare('SELECT name FROM warehouses WHERE warehouse_id = ?').get(batch.warehouse_id) as any;
      const fruit = db.prepare('SELECT name FROM fruit_products WHERE product_id = ?').get(batch.product_id) as any;
      const movCode = `MOV-${Date.now().toString().slice(-4)}`;

      db.prepare(`
        INSERT INTO inventory_movements (movement_code, batch_number, product_name, movement_type, quantity_delta, unit, source_location, dest_location, performed_by, notes)
        VALUES (?, ?, ?, 'MANUAL_ADJUSTMENT', ?, ?, ?, ?, 'System Operator', ?)
      `).run(movCode, batch.batch_number, fruit.name, delta, batch.unit, wh.name, reason, notes || 'Audit Adjustment');
    });

    executeAdjustment();
    res.json({ message: 'Stock adjusted successfully in relational database' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 6. Procurement & Purchase Orders
app.get('/api/purchase-orders', (_req: Request, res: Response) => {
  try {
    const pos = db.prepare(`
      SELECT 
        p.po_id as id, p.po_number as poNumber, p.supplier_id as supplierId,
        s.name as supplierName, p.warehouse_id as warehouseId, w.name as warehouseName,
        p.order_date as orderDate, p.expected_delivery_date as expectedDeliveryDate,
        p.status, p.subtotal, p.tax, p.grand_total as grandTotal, p.approved_by as approvedBy,
        p.notes
      FROM purchase_orders p
      JOIN suppliers s ON p.supplier_id = s.supplier_id
      JOIN warehouses w ON p.warehouse_id = w.warehouse_id
      ORDER BY p.po_id DESC
    `).all() as any[];

    for (const po of pos) {
      const items = db.prepare(`
        SELECT 
          i.product_id as productId, f.name as productName, f.sku,
          i.quantity_ordered as quantityOrdered, i.quantity_received as quantityReceived,
          i.unit, i.unit_price as unitPrice, i.total_cost as totalCost
        FROM purchase_order_items i
        JOIN fruit_products f ON i.product_id = f.product_id
        WHERE i.purchase_order_id = ?
      `).all(po.id);
      po.items = items;
    }

    res.json(pos);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/purchase-orders', (req: Request, res: Response) => {
  try {
    const { supplierId, warehouseId, items, notes } = req.body;
    let subtotal = 0;

    const createPO = db.transaction(() => {
      const poNum = `PO-2026-${String(Math.floor(Math.random() * 90000) + 10000)}`;
      const orderDate = new Date().toISOString().split('T')[0];
      const deliveryDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

      const poInfo = db.prepare(`
        INSERT INTO purchase_orders (po_number, supplier_id, warehouse_id, order_date, expected_delivery_date, status, subtotal, tax, grand_total, notes)
        VALUES (?, ?, ?, ?, ?, 'PENDING_APPROVAL', 0, 0, 0, ?)
      `).run(poNum, supplierId, warehouseId, orderDate, deliveryDate, notes || '');

      const poId = poInfo.lastInsertRowid;

      for (const item of items) {
        const fruit = db.prepare('SELECT name, unit, purchase_price FROM fruit_products WHERE product_id = ?').get(item.productId) as any;
        const price = item.unitPrice || fruit.purchase_price;
        const total = item.quantityOrdered * price;
        subtotal += total;

        db.prepare(`
          INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity_ordered, quantity_received, unit, unit_price, total_cost)
          VALUES (?, ?, ?, 0, ?, ?, ?)
        `).run(poId, item.productId, item.quantityOrdered, fruit.unit, price, total);
      }

      db.prepare('UPDATE purchase_orders SET subtotal = ?, grand_total = ? WHERE po_id = ?').run(subtotal, subtotal, poId);
      db.prepare('UPDATE suppliers SET active_orders_count = active_orders_count + 1 WHERE supplier_id = ?').run(supplierId);

      return poId;
    });

    const newPoId = createPO();
    res.status(201).json({ id: newPoId, message: 'Purchase Order created in database' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/purchase-orders/:id/approve', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const approver = req.body.approvedBy || 'Elena Vance';
    db.prepare('UPDATE purchase_orders SET status = ?, approved_by = ? WHERE po_id = ?').run('APPROVED', approver, id);
    res.json({ message: 'Purchase Order Approved in database' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// REAL TRANSACTIONAL GOODS RECEIPT & FEFO BATCH GENERATION
app.post('/api/purchase-orders/:id/receive', (req: Request, res: Response) => {
  try {
    const poId = req.params.id;
    const { acceptedItems, remarks } = req.body;

    const receiveGoodsTransaction = db.transaction(() => {
      const po = db.prepare('SELECT * FROM purchase_orders WHERE po_id = ?').get(poId) as any;
      if (!po) throw new Error('Purchase order not found');

      const items = db.prepare('SELECT * FROM purchase_order_items WHERE purchase_order_id = ?').all(poId) as any[];

      items.forEach((item, idx) => {
        const receivedQty = acceptedItems ? parseFloat(acceptedItems[idx]?.acceptedQty || item.quantity_ordered) : item.quantity_ordered;
        db.prepare('UPDATE purchase_order_items SET quantity_received = ? WHERE po_item_id = ?').run(receivedQty, item.po_item_id);

        const fruit = db.prepare('SELECT * FROM fruit_products WHERE product_id = ?').get(item.product_id) as any;
        const shelfDays = fruit.expected_shelf_life_days || 14;
        const recDate = new Date().toISOString().split('T')[0];
        const expDate = new Date(Date.now() + shelfDays * 86400000).toISOString().split('T')[0];
        const batchNum = `BATCH-2026-${fruit.sku.slice(4, 7)}-${String(Math.floor(Math.random() * 900) + 100)}`;

        db.prepare(`
          INSERT INTO inventory_batches (batch_number, product_id, supplier_id, purchase_order_id, warehouse_id, zone, received_date, expiry_date, days_to_expiry, initial_quantity, quantity_available, quantity_reserved, quantity_damaged, unit, purchase_cost)
          VALUES (?, ?, ?, ?, ?, 'Zone B - Standard Cold', ?, ?, ?, ?, ?, 0, 0, ?, ?)
        `).run(batchNum, item.product_id, po.supplier_id, poId, po.warehouse_id, recDate, expDate, shelfDays, receivedQty, receivedQty, fruit.unit, item.unit_price);

        db.prepare('UPDATE fruit_products SET current_stock = current_stock + ? WHERE product_id = ?').run(receivedQty, item.product_id);

        const movCode = `MOV-${Date.now().toString().slice(-4)}`;
        const wh = db.prepare('SELECT name FROM warehouses WHERE warehouse_id = ?').get(po.warehouse_id) as any;
        const sup = db.prepare('SELECT name FROM suppliers WHERE supplier_id = ?').get(po.supplier_id) as any;

        db.prepare(`
          INSERT INTO inventory_movements (movement_code, batch_number, product_name, movement_type, quantity_delta, unit, source_location, dest_location, performed_by, notes)
          VALUES (?, ?, ?, 'INBOUND_RECEIPT', ?, ?, ?, ?, 'Dock Receiving Lead', ?)
        `).run(movCode, batchNum, fruit.name, receivedQty, fruit.unit, `Supplier: ${sup.name}`, wh.name, `Goods receipt for ${po.po_number}. ${remarks || ''}`);
      });

      db.prepare('UPDATE purchase_orders SET status = ? WHERE po_id = ?').run('FULLY_RECEIVED', poId);
    });

    receiveGoodsTransaction();
    res.json({ message: 'Goods received and FEFO batches created transactionally in SQLite' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 7. Sales Orders & FEFO Allocation API
app.get('/api/sales/orders', (_req: Request, res: Response) => {
  try {
    const sos = db.prepare(`
      SELECT 
        s.sales_order_id as id, s.so_number as soNumber, s.customer_id as customerId,
        c.business_name as customerName, c.category as customerCategory,
        s.order_date as orderDate, s.dispatch_date as dispatchDate,
        s.status, s.subtotal, s.discount, s.grand_total as grandTotal, s.payment_status as paymentStatus
      FROM sales_orders s
      JOIN customers c ON s.customer_id = c.customer_id
      ORDER BY s.sales_order_id DESC
    `).all() as any[];

    for (const so of sos) {
      const items = db.prepare(`
        SELECT 
          i.so_item_id as soItemId, i.product_id as productId, f.name as productName,
          i.quantity_ordered as quantityOrdered, i.quantity_allocated as quantityAllocated,
          i.unit, i.unit_price as unitPrice, i.total_price as totalPrice
        FROM sales_order_items i
        JOIN fruit_products f ON i.product_id = f.product_id
        WHERE i.sales_order_id = ?
      `).all(so.id) as any[];

      for (const it of items) {
        const allocs = db.prepare(`
          SELECT batch_number as batchNumber, allocated_quantity as quantity, expiry_date as expiryDate
          FROM sales_order_allocations
          WHERE so_item_id = ?
        `).all(it.soItemId);
        it.allocatedBatches = allocs;
      }
      so.items = items;
    }

    res.json(sos);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/sales/customers', (_req: Request, res: Response) => {
  try {
    const customers = db.prepare(`
      SELECT 
        customer_id as id, customer_code as code, business_name as businessName,
        contact_person as contactPerson, category, email, phone, city, country,
        credit_limit as creditLimit, current_balance as currentBalance,
        discount_rate as discountRate
      FROM customers
    `).all();
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE SALES ORDER WITH REAL SQL FEFO ALLOCATION ALGORITHM
app.post('/api/sales/orders', (req: Request, res: Response) => {
  try {
    const { customerId, items } = req.body;

    const createOrderTransaction = db.transaction(() => {
      const cust = db.prepare('SELECT * FROM customers WHERE customer_id = ?').get(customerId) as any;
      if (!cust) throw new Error('Customer not found');

      const soNum = `SO-2026-${String(Math.floor(Math.random() * 90000) + 20000)}`;
      const orderDate = new Date().toISOString().split('T')[0];
      const dispatchDate = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];

      let subtotal = 0;

      const soInfo = db.prepare(`
        INSERT INTO sales_orders (so_number, customer_id, order_date, dispatch_date, status, subtotal, discount, grand_total, payment_status)
        VALUES (?, ?, ?, ?, 'CONFIRMED', 0, 0, 0, 'UNPAID')
      `).run(soNum, customerId, orderDate, dispatchDate);

      const soId = soInfo.lastInsertRowid;

      for (const item of items) {
        const fruit = db.prepare('SELECT name, unit, wholesale_price FROM fruit_products WHERE product_id = ?').get(item.productId) as any;
        const price = item.unitPrice || fruit.wholesale_price;
        const lineTotal = item.quantityOrdered * price;
        subtotal += lineTotal;

        const soItemInfo = db.prepare(`
          INSERT INTO sales_order_items (sales_order_id, product_id, quantity_ordered, quantity_allocated, unit, unit_price, total_price)
          VALUES (?, ?, ?, 0, ?, ?, ?)
        `).run(soId, item.productId, item.quantityOrdered, fruit.unit, price, lineTotal);

        const soItemId = soItemInfo.lastInsertRowid;

        // FEFO QUERY: Find earliest expiring batches
        const availableBatches = db.prepare(`
          SELECT * FROM inventory_batches 
          WHERE product_id = ? AND quantity_available > 0 AND qc_status = 'PASSED'
          ORDER BY expiry_date ASC
        `).all(item.productId) as any[];

        let needed = item.quantityOrdered;
        for (const batch of availableBatches) {
          if (needed <= 0) break;
          const alloc = Math.min(batch.quantity_available, needed);
          
          db.prepare(`
            UPDATE inventory_batches 
            SET quantity_available = quantity_available - ?, quantity_reserved = quantity_reserved + ?
            WHERE batch_id = ?
          `).run(alloc, alloc, batch.batch_id);

          db.prepare(`
            INSERT INTO sales_order_allocations (so_item_id, batch_number, allocated_quantity, expiry_date)
            VALUES (?, ?, ?, ?)
          `).run(soItemId, batch.batch_number, alloc, batch.expiry_date);

          needed -= alloc;
        }

        db.prepare('UPDATE sales_order_items SET quantity_allocated = ? WHERE so_item_id = ?').run(item.quantityOrdered - needed, soItemId);
      }

      const discount = subtotal * (cust.discount_rate / 100);
      const grandTotal = subtotal - discount;

      db.prepare('UPDATE sales_orders SET subtotal = ?, discount = ?, grand_total = ? WHERE sales_order_id = ?').run(subtotal, discount, grandTotal, soId);
      db.prepare('UPDATE customers SET current_balance = current_balance + ? WHERE customer_id = ?').run(grandTotal, customerId);

      return soId;
    });

    const newSoId = createOrderTransaction();
    res.status(201).json({ id: newSoId, message: 'Sales Order booked and batches allocated via FEFO in SQLite' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DISPATCH SALES ORDER & SPAWN REEFER SHIPMENT
app.post('/api/sales/orders/:id/dispatch', (req: Request, res: Response) => {
  try {
    const soId = req.params.id;

    const dispatchTransaction = db.transaction(() => {
      const so = db.prepare(`
        SELECT s.*, c.business_name FROM sales_orders s
        JOIN customers c ON s.customer_id = c.customer_id
        WHERE s.sales_order_id = ?
      `).get(soId) as any;
      if (!so) throw new Error('Sales order not found');

      db.prepare('UPDATE sales_orders SET status = ? WHERE sales_order_id = ?').run('DISPATCHED', soId);

      // Decrement reserved batch stock and log outbound movement
      const allocations = db.prepare(`
        SELECT a.batch_number, a.allocated_quantity, f.name as productName, f.unit, f.product_id
        FROM sales_order_allocations a
        JOIN sales_order_items i ON a.so_item_id = i.so_item_id
        JOIN fruit_products f ON i.product_id = f.product_id
        WHERE i.sales_order_id = ?
      `).all(soId) as any[];

      for (const a of allocations) {
        db.prepare('UPDATE inventory_batches SET quantity_reserved = MAX(0, quantity_reserved - ?) WHERE batch_number = ?').run(a.allocated_quantity, a.batch_number);
        db.prepare('UPDATE fruit_products SET current_stock = MAX(0, current_stock - ?) WHERE product_id = ?').run(a.allocated_quantity, a.product_id);

        const movCode = `MOV-${Date.now().toString().slice(-4)}`;
        db.prepare(`
          INSERT INTO inventory_movements (movement_code, batch_number, product_name, movement_type, quantity_delta, unit, source_location, dest_location, performed_by, notes)
          VALUES (?, ?, ?, 'OUTBOUND_SALE', ?, ?, 'Warehouse Staging', ?, 'Dispatch Controller', ?)
        `).run(movCode, a.batch_number, a.productName, -a.allocated_quantity, a.unit, `Customer: ${so.business_name}`, `Consignment for ${so.so_number}`);
      }

      // Create Shipment Record
      const shpNum = `SHP-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      const depTime = new Date().toISOString().replace('T', ' ').slice(0, 16);
      const arrTime = new Date(Date.now() + 5 * 3600000).toISOString().replace('T', ' ').slice(0, 16);

      db.prepare(`
        INSERT INTO shipments (shipment_number, so_number, customer_name, vehicle_plate, driver_name, driver_phone, route, departure_time, estimated_arrival, status, current_temp_celsius, setpoint_temp_celsius, transport_cost)
        VALUES (?, ?, ?, 'IL-REEF-9902', 'Robert Kozlowski', '+1-312-555-9012', ?, ?, ?, 'IN_TRANSIT', 2.2, 2.0, 340.00)
      `).run(shpNum, so.so_number, so.business_name, `Central Hub -> ${so.business_name} Receiving Bay`, depTime, arrTime);
    });

    dispatchTransaction();
    res.json({ message: 'Order dispatched and reefer shipment generated in SQLite' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 8. Quality Control & Spoilage
app.get('/api/qc/inspections', (_req: Request, res: Response) => {
  try {
    const inspections = db.prepare(`
      SELECT 
        inspection_id as id, inspection_code as code, batch_number as batchNumber,
        product_name as productName, inspector_name as inspectorName,
        brix_sweetness as brixSweetness, firmness_kgf as firmnessKgf,
        defect_percentage as defectPercentage, verdict, inspection_date as date, notes
      FROM quality_inspections
      ORDER BY inspection_id DESC
    `).all();
    res.json(inspections);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/qc/inspections', (req: Request, res: Response) => {
  try {
    const { batchId, brixSweetness, firmnessKgf, defectPercentage, verdict, notes } = req.body;
    const batch = db.prepare('SELECT b.*, f.name as productName FROM inventory_batches b JOIN fruit_products f ON b.product_id = f.product_id WHERE b.batch_id = ?').get(batchId) as any;
    if (!batch) return res.status(404).json({ error: 'Batch not found' });

    const code = `QC-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
    const date = new Date().toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO quality_inspections (inspection_code, batch_number, product_name, inspector_name, brix_sweetness, firmness_kgf, defect_percentage, verdict, inspection_date, notes)
      VALUES (?, ?, ?, 'Tariq Al-Mansoor', ?, ?, ?, ?, ?, ?)
    `).run(code, batch.batch_number, batch.productName, parseFloat(brixSweetness), parseFloat(firmnessKgf), parseFloat(defectPercentage), verdict, date, notes || '');

    res.status(201).json({ message: 'Inspection logged successfully in database' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/qc/spoilage', (_req: Request, res: Response) => {
  try {
    const records = db.prepare(`
      SELECT 
        spoilage_id as id, spoilage_code as code, batch_number as batchNumber,
        product_name as productName, quantity_spoiled as quantitySpoiled, unit,
        total_received as totalReceived, spoilage_percentage as spoilagePercentage,
        financial_loss as financialLoss, reason, action_taken as actionTaken,
        recorded_by as recordedBy, record_date as date
      FROM spoilage_records
      ORDER BY spoilage_id DESC
    `).all();
    res.json(records);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/qc/spoilage', (req: Request, res: Response) => {
  try {
    const { batchId, quantitySpoiled, reason, actionTaken } = req.body;
    const qty = parseFloat(quantitySpoiled);

    const recordSpoilageTx = db.transaction(() => {
      const batch = db.prepare('SELECT b.*, f.name as productName FROM inventory_batches b JOIN fruit_products f ON b.product_id = f.product_id WHERE b.batch_id = ?').get(batchId) as any;
      if (!batch) throw new Error('Batch not found');
      if (qty > batch.quantity_available) throw new Error('Spoiled quantity exceeds available stock');

      const spoilagePercentage = parseFloat(((qty / batch.initial_quantity) * 100).toFixed(2));
      const financialLoss = parseFloat((qty * batch.purchase_cost).toFixed(2));
      const code = `SPL-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
      const date = new Date().toISOString().split('T')[0];

      db.prepare(`
        INSERT INTO spoilage_records (spoilage_code, batch_number, product_name, quantity_spoiled, unit, total_received, spoilage_percentage, financial_loss, reason, action_taken, recorded_by, record_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Tariq Al-Mansoor (QC Lead)', ?)
      `).run(code, batch.batch_number, batch.productName, qty, batch.unit, batch.initial_quantity, spoilagePercentage, financialLoss, reason, actionTaken, date);

      db.prepare('UPDATE inventory_batches SET quantity_available = quantity_available - ?, quantity_damaged = quantity_damaged + ? WHERE batch_id = ?').run(qty, qty, batchId);
      db.prepare('UPDATE fruit_products SET current_stock = MAX(0, current_stock - ?) WHERE product_id = ?').run(qty, batch.product_id);

      const movCode = `MOV-${Date.now().toString().slice(-4)}`;
      db.prepare(`
        INSERT INTO inventory_movements (movement_code, batch_number, product_name, movement_type, quantity_delta, unit, source_location, dest_location, performed_by, notes)
        VALUES (?, ?, ?, 'SPOILAGE_WRITE_OFF', ?, ?, 'Cold Room Staging', ?, 'Tariq Al-Mansoor', ?)
      `).run(movCode, batch.batch_number, batch.productName, -qty, batch.unit, `${actionTaken} Bay`, `Spoilage reason: ${reason}`);
    });

    recordSpoilageTx();
    res.status(201).json({ message: 'Spoilage loss recorded and stock decremented in SQLite' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 9. Shipments API
app.get('/api/logistics/shipments', (_req: Request, res: Response) => {
  try {
    const shipments = db.prepare(`
      SELECT 
        shipment_id as id, shipment_number as shipmentNumber, so_number as soNumber,
        customer_name as customerName, vehicle_plate as vehiclePlate,
        driver_name as driverName, driver_phone as driverPhone, route,
        departure_time as departureTime, estimated_arrival as estimatedArrival,
        status, current_temp_celsius as currentTempCelsius,
        setpoint_temp_celsius as setpointTempCelsius, transport_cost as transportCost
      FROM shipments
      ORDER BY shipment_id DESC
    `).all();
    res.json(shipments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Financial Overview API
app.get('/api/finance/overview', (_req: Request, res: Response) => {
  try {
    const ar = db.prepare('SELECT COALESCE(SUM(current_balance), 0) as total FROM customers').get() as { total: number };
    const ap = db.prepare('SELECT COALESCE(SUM(outstanding_balance), 0) as total FROM suppliers').get() as { total: number };
    const rev = db.prepare('SELECT COALESCE(SUM(grand_total), 0) as total FROM sales_orders').get() as { total: number };
    const exp = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM expenses').get() as { total: number };
    const spl = db.prepare('SELECT COALESCE(SUM(financial_loss), 0) as total FROM spoilage_records').get() as { total: number };
    const expensesList = db.prepare(`
      SELECT 
        expense_id as id,
        expense_id,
        code,
        category,
        warehouse_name as warehouseName,
        warehouse_name,
        amount,
        expense_date as date,
        expense_date,
        payee
      FROM expenses 
      ORDER BY expense_id DESC
    `).all();

    res.json({
      accountsReceivable: ar.total,
      outstandingPayable: ap.total,
      accountsPayable: ap.total,
      totalRevenue: rev.total,
      totalExpenses: exp.total,
      spoilageLoss: spl.total,
      expensesList
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 11. LIVE SQL CONSOLE API: Allows running live SQL queries directly against the database engine!
app.post('/api/sql/query', (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const query = (req.body.sql || '').trim();
    if (!query) return res.status(400).json({ error: 'SQL query string required' });

    // Protect against destructive database drops
    if (query.toUpperCase().includes('DROP DATABASE')) {
      return res.status(403).json({ error: 'DROP DATABASE is restricted' });
    }

    const isSelect = query.toUpperCase().startsWith('SELECT') || query.toUpperCase().startsWith('PRAGMA') || query.toUpperCase().startsWith('EXPLAIN');

    if (isSelect) {
      const stmt = db.prepare(query);
      const rows = stmt.all();
      const columns = rows.length > 0 ? Object.keys(rows[0] as object) : [];
      const durationMs = Date.now() - startTime;
      res.json({ success: true, isSelect: true, columns, rows, rowCount: rows.length, durationMs });
    } else {
      const info = db.prepare(query).run();
      const durationMs = Date.now() - startTime;
      res.json({ success: true, isSelect: false, changes: info.changes, lastInsertRowid: info.lastInsertRowid, durationMs });
    }
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message, durationMs: Date.now() - startTime });
  }
});

// Table Schema Inspector
app.get('/api/sql/tables', (_req: Request, res: Response) => {
  try {
    const tables = db.prepare(`
      SELECT name, type FROM sqlite_master 
      WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%'
      ORDER BY name ASC
    `).all() as any[];

    const result = tables.map(t => {
      const count = (db.prepare(`SELECT COUNT(*) as c FROM "${t.name}"`).get() as any).c;
      const columns = db.prepare(`PRAGMA table_info("${t.name}")`).all();
      return {
        tableName: t.name,
        rowCount: count,
        columns: columns.map((col: any) => ({
          name: col.name,
          type: col.type,
          notNull: col.notnull === 1,
          isPk: col.pk > 0
        }))
      };
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================================
// VITE DEV SERVER / PRODUCTION STATIC ASSET SERVING
// =====================================================================

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FSCMS] Full-Stack Database Engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
