# FSCMS Data Dictionary & Relational Schema Documentation

## Database Specifications
- **RDBMS Engine:** MySQL 8.0+ / InnoDB
- **Charset / Collation:** utf8mb4 / utf8mb4_unicode_ci
- **Key Architecture:** Surrogate BIGINT UNSIGNED AUTO_INCREMENT primary keys with immutable audit trails.
- **Financial Precision:** DECIMAL(15,2) for currencies; DECIMAL(12,2) for batch weights/quantities.
- **Inventory Model:** Batch-level tracking with strict FEFO (First Expired, First Out) allocation policy.

---

## 1. Core Entity Modules

### A. Master Data
- `users`: Operational users, hashed passwords, contact info, active state.
- `roles`: Role definitions (Super Admin, Manager, Procurement Officer, Warehouse Manager, Quality Inspector, Sales Manager, Accountant, Logistics Manager).
- `permissions`: Granular capability flags.
- `role_permissions`: Many-to-many junction between roles and permissions.
- `user_roles`: User assignment to roles.
- `suppliers`: Commercial vendors, cooperatives, orchards, and importers with credit limits, rating (1-5), and quality score (0-100%).
- `farmers`: Individual agricultural producers tied to supplier accounts.
- `orchards`: Specific geographical planting sites with GPS latitude/longitude, altitude, soil type, and hectare size.
- `customers`: Wholesale clients, supermarket chains, and food processors with credit limits and tier discounts.
- `fruit_categories`: Classification (Tropical, Citrus, Berries, Pomes, Melons).
- `fruit_products`: SKU, name, variety, origin, storage temp min/max (°C), humidity min/max (%), shelf life (days), minimum stock threshold, reorder quantities.
- `fruit_varieties`: Brix sweetness targets, flesh firmness (kgf), and skin color rating.
- `fruit_grades`: Grade A+, Grade A, Grade B, Processing grade with price multipliers.
- `units_of_measure`: Base units (KG, MT, Crate, Carton, Punnet) and conversion factors.
- `unit_conversions`: Explicit conversion matrix between packaging standards.

### B. Procurement
- `purchase_requisitions`: Internal department fruit requisition requests.
- `purchase_requisition_items`: Line items specifying required quantity, UOM, and target price.
- `purchase_orders`: Binding procurement orders sent to suppliers with lifecycle statuses (`DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `PARTIALLY_RECEIVED`, `FULLY_RECEIVED`, `CANCELLED`).
- `purchase_order_items`: Specific fruit SKUs, grades, ordered vs received quantities.
- `goods_receipts`: Dock arrival records capturing delivery notes, carrier plate, and receiver.
- `goods_receipt_items`: Received, accepted, and rejected quantities with defect reason.
- `supplier_invoices`: Commercial billing from supplier.
- `supplier_invoice_items`: Matched against goods receipt accepted lines.
- `supplier_payments`: Outgoing payments referencing invoice and payment method.

### C. Inventory & FEFO Batch Ledger
- `inventory_batches`: Perishable fruit batches with unique batch numbers, expiry dates, harvest dates, quantities (available, reserved, damaged), and QC clearance.
- `inventory_balances`: Aggregated physical, reserved, and available stock per product per warehouse.
- `inventory_movements`: Immutable double-entry stock movement log (`INBOUND_RECEIPT`, `OUTBOUND_SALE`, `TRANSFER_OUT`, `TRANSFER_IN`, `QC_SPOILAGE_LOSS`, `MANUAL_ADJUSTMENT`).
- `stock_adjustments`: Manager-authorized adjustments for shrinkage, audits, or inventory write-offs.
- `stock_transfers`: Inter-warehouse transit with origin and destination warehouse locking.
- `inventory_reservations`: Temporary reservations locking batch stock for open sales orders.

### D. Quality Control & Spoilage
- `quality_inspections`: Incoming and routine tests (Brix refractometer reading, penetrometer firmness, skin defect %).
- `quality_inspection_items`: Individual test standards and compliance verdicts.
- `spoilage_records`: Spoilage logs with formula: `Spoilage % = (Spoiled Quantity / Total Received Quantity) * 100`.
- `spoilage_reasons`: Categorized causes (Over-ripening, temperature failure, transport impact, mold/fungi, ethylene gas).
- `temperature_logs`: IoT cold room telemetry (temperature °C and humidity %) with threshold alarm flags.
- `quality_certificates`: Phytosanitary and GlobalG.A.P. certificate records.

### E. Sales, Logistics & Finance
- `sales_orders`: Client purchase orders with lifecycle (`DRAFT`, `CONFIRMED`, `PROCESSING`, `PACKED`, `DISPATCHED`, `DELIVERED`).
- `sales_order_allocations`: Automatic FEFO batch assignment satisfying order demand.
- `sales_invoices`: Billing generated for delivered orders.
- `customer_payments`: Cash, wire, or credit receipts against sales invoices.
- `shipments`: Outbound cold-chain consignments with reefer vehicle, driver, and temperature logging.
- `shipment_tracking_events`: GPS milestones and cold-chain temperature telemetry in transit.
- `expenses`: Logistics, energy, refrigeration, and packing costs.
- `audit_logs`: Timestamped user activity capturing old vs new values.
