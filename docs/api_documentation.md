# Fruit Supply Chain Management System (FSCMS) - API Reference

## Base URL
`/api`

All responses are formatted in JSON with standard HTTP status codes.

---

## 1. Authentication & Users
- `POST /api/auth/login`: Authenticate system user with JWT token.
- `GET /api/auth/me`: Get active user profile and RBAC permissions.
- `POST /api/auth/logout`: Revoke active session token.

## 2. Products Catalog
- `GET /api/products`: Retrieve all 15 fruit SKUs with storage temperature and shelf life specs.
- `POST /api/products`: Register a new fruit product into master catalog.
- `PUT /api/products/:id`: Update price, minimum stock threshold, or active status.

## 3. Suppliers & Orchards
- `GET /api/suppliers`: List agricultural producers, cooperatives, and importers.
- `POST /api/suppliers`: Onboard a new grower with payment terms, rating, and quality score.

## 4. Procurement Workflow
- `GET /api/purchase-orders`: Retrieve all active and completed purchase orders.
- `POST /api/purchase-orders`: Create and issue purchase order to supplier.
- `POST /api/purchase-orders/:id/approve`: Authorize approved PO for delivery intake.
- `POST /api/purchase-orders/:id/receive`: Execute dock goods receipt, create perishable inventory batches, and log movement transactions.

## 5. Inventory & FEFO Batches
- `GET /api/inventory/batches`: Query perishable batches sorted by FEFO (First Expired, First Out).
- `GET /api/inventory/movements`: Provenance and audit ledger for all stock changes.
- `POST /api/inventory/adjustments`: Authorize manual shrinkage or audit reconciliations.

## 6. Cold Storage & Warehouses
- `GET /api/warehouses`: Multi-facility status, capacity occupancy %, and IoT temperature & humidity telemetry.

## 7. Quality Control & Spoilage
- `GET /api/qc/inspections`: Penetrometer firmness and refractometer Brix sugar logs.
- `POST /api/qc/inspections`: Save quality audit certificate.
- `GET /api/qc/spoilage`: List spoilage write-off logs.
- `POST /api/qc/spoilage`: Record spoilage write-off using standard formula: `(Spoiled Qty / Total Received) * 100`.

## 8. Sales & Fulfillment
- `GET /api/sales/orders`: Client orders with allocated FEFO batch references.
- `POST /api/sales/orders`: Book order with automated FEFO batch allocation.
- `POST /api/sales/orders/:id/dispatch`: Dispatch order, decrement reserved stock, and spawn cold shipment.
- `GET /api/sales/customers`: Retail supermarkets and wholesale client accounts.

## 9. Logistics Fleet
- `GET /api/logistics/shipments`: Active refrigerated truck and container shipments with live sensor telemetry.

## 10. Financial Management
- `GET /api/finance/overview`: Consolidated P&L, Accounts Receivable, and Accounts Payable.
