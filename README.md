# Fruit Supply Chain Management System (FSCMS)

Enterprise-grade, end-to-end full-stack Fruit Supply Chain Management System designed for high-value perishable fruits with cold-chain monitoring, automated FEFO (First Expired, First Out) batch tracking, procurement, logistics, and a fully normalized MySQL 8.0 relational database architecture.

---

## 🌟 Key Features

1. **Perishable Inventory & FEFO Engine:**
   - Automated First Expired, First Out (FEFO) batch allocation.
   - Perishable expiration countdowns (< 3 days urgent, < 7 days warning).
   - Immutable double-entry inventory movements ledger with zero-negative-balance enforcement.

2. **Cold-Chain Infrastructure & IoT Telemetry:**
   - Multi-warehouse facilities (Cold Storage, Controlled Atmosphere, Ripening Vaults).
   - Real-time temperature (°C) and relative humidity (%) sensor tracking with threshold alarms.

3. **15 Hot-Selling Fruits Catalog:**
   - Mangoes (Alphonso), Bananas (Cavendish), Apples (Honeycrisp), Oranges (Valencia), Grapes (Thompson Seedless), Strawberries (Chandler), Watermelons (Sugar Baby), Pomegranates (Wonderful), Dates (Medjool), Avocados (Hass), Kiwis (Hayward), Pineapples (MD2 Gold), Peaches (Elberta), Guavas (Safeda), Papayas (Red Lady).
   - Pre-configured storage temperature ranges, expected shelf-life days, and reorder levels.

4. **Procurement & Goods Receipt Workflow:**
   - Multi-step PO lifecycle: Draft &rarr; Pending Approval &rarr; Approved &rarr; Dock Receiving.
   - Transactional creation of inventory batches upon goods receipt.

5. **Quality Control & Spoilage Tracking:**
   - Brix sweetness (°Bx) and firmness (kgf) test logging.
   - Standard Spoilage Formula: `Spoilage % = (Spoiled Quantity / Total Received Quantity) * 100`.
   - Spoilage write-off loss valuation and disposition tracking (composted, destroyed, biofuel salvage).

6. **Relational MySQL 8.0 Database Architecture (66 Tables):**
   - Normalized to 3NF with InnoDB storage engine, UTF8mb4 encoding, foreign keys, and indexes.
   - In-app interactive visual ERD and 66-table searchable catalog.
   - Ready-to-run `/database/schema.sql`, `/database/seed.sql`, and `/database/indexes.sql`.

7. **Reports & Demand Forecasting:**
   - Instant one-click CSV and JSON exports for Inventory, Sales, and Spoilage.
   - 4-week moving average statistical seasonal demand forecasting.

---

## 🚀 Quick Start Guide

### 1. Local Development
```bash
# Install dependencies
npm install

# Start full-stack development server (Express API + Vite SPA)
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Docker & MySQL 8.0 Deployment
```bash
# Boot complete system with MySQL 8.0 and FSCMS app
docker-compose up -d
```
This initializes the `fruit_supply_chain_db` database using the scripts in `database/`.

---

## 🗄️ Relational Schema Files
- `database/schema.sql`: Full MySQL 8.0 DDL for all 66 tables.
- `database/seed.sql`: Seed data for 15 fruits, growers, warehouses, and batches.
- `database/indexes.sql`: High-performance composite indexes.
- `docs/fruit_supply_chain_erd.mmd`: Complete Mermaid ERD diagram.
- `docs/data_dictionary.md`: Full entity and column dictionary.
- `docs/api_documentation.md`: REST API reference.
