-- =====================================================================
-- PERFORMANCE OPTIMIZATION INDEXES FOR FSCMS (MySQL 8.0)
-- Optimized for FEFO batch allocation, cold-chain IoT telemetry,
-- and high-throughput inventory movement ledgers.
-- =====================================================================

USE fruit_supply_chain_db;

-- 1. FEFO & Perishable Inventory Batch Lookup Indexes
CREATE INDEX idx_batches_fefo ON inventory_batches (product_id, expiry_date, quantity_available, qc_status);
CREATE INDEX idx_batches_wh ON inventory_batches (warehouse_id, is_active);
CREATE INDEX idx_batches_expiry ON inventory_batches (expiry_date ASC);
CREATE INDEX idx_batches_supplier ON inventory_batches (supplier_id);

-- 2. Inventory Movements Audit Trail
CREATE INDEX idx_im_batch_time ON inventory_movements (batch_id, movement_timestamp);
CREATE INDEX idx_im_type ON inventory_movements (movement_type, movement_timestamp);

-- 3. Sales Order & FEFO Allocation Indexes
CREATE INDEX idx_so_status ON sales_orders (order_status, order_date);
CREATE INDEX idx_so_customer ON sales_orders (customer_id, order_date);
CREATE INDEX idx_soa_batch ON sales_order_allocations (batch_id);

-- 4. Procurement & Goods Receipts
CREATE INDEX idx_po_status ON purchase_orders (status, order_date);
CREATE INDEX idx_po_supplier ON purchase_orders (supplier_id);
CREATE INDEX idx_gr_po ON goods_receipts (purchase_order_id);

-- 5. Quality Control & Spoilage
CREATE INDEX idx_qi_batch ON quality_inspections (batch_id, inspected_at);
CREATE INDEX idx_spoilage_batch ON spoilage_records (batch_id, recorded_at);
CREATE INDEX idx_temp_logs_wh_time ON temperature_logs (warehouse_id, logged_at);

-- 6. Logistics & Cold Chain
CREATE INDEX idx_shipments_status ON shipments (shipment_status, planned_departure);
CREATE INDEX idx_shipments_so ON shipments (sales_order_id);
CREATE INDEX idx_ste_shipment ON shipment_tracking_events (shipment_id, occurred_at);

-- 7. Accounts Payable & Receivable
CREATE INDEX idx_ap_status ON accounts_payable (status, due_date);
CREATE INDEX idx_ar_status ON accounts_receivable (status, due_date);
