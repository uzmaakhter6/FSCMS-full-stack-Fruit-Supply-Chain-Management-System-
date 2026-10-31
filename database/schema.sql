-- =====================================================================
-- FRUIT SUPPLY CHAIN MANAGEMENT SYSTEM (FSCMS)
-- MySQL 8.0+ Enterprise Relational Database Schema
-- Storage Engine: InnoDB | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- Normalized to 3NF with Referential Integrity, Strict Foreign Keys,
-- Immutable Audit Trails, and Batch/FEFO Tracking.
-- =====================================================================

DROP DATABASE IF EXISTS fruit_supply_chain_db;
CREATE DATABASE fruit_supply_chain_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE fruit_supply_chain_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- 1. MASTER DATA: AUTHENTICATION, USERS, ROLES & PERMISSIONS
-- ---------------------------------------------------------------------

CREATE TABLE roles (
    role_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE permissions (
    permission_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    permission_code VARCHAR(100) NOT NULL UNIQUE,
    module VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE role_permissions (
    role_id BIGINT UNSIGNED NOT NULL,
    permission_id BIGINT UNSIGNED NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles (role_id) ON DELETE CASCADE,
    CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions (permission_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE users (
    user_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(60) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(60) NOT NULL,
    last_name VARCHAR(60) NOT NULL,
    phone VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE user_roles (
    user_id BIGINT UNSIGNED NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles (role_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. MASTER DATA: SUPPLIERS, FARMERS & ORCHARDS
-- ---------------------------------------------------------------------

CREATE TABLE suppliers (
    supplier_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    supplier_code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    supplier_type ENUM('FARMER', 'COMMERCIAL_GROWER', 'COOPERATIVE', 'IMPORTER', 'DISTRIBUTOR') NOT NULL DEFAULT 'COMMERCIAL_GROWER',
    tax_number VARCHAR(50),
    email VARCHAR(120),
    phone VARCHAR(30) NOT NULL,
    address_line1 VARCHAR(200) NOT NULL,
    address_line2 VARCHAR(200),
    city VARCHAR(80) NOT NULL,
    state_province VARCHAR(80),
    country VARCHAR(80) NOT NULL,
    postal_code VARCHAR(20),
    sourcing_region VARCHAR(100),
    payment_terms_days INT UNSIGNED NOT NULL DEFAULT 30,
    credit_limit DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    rating DECIMAL(3,2) NOT NULL DEFAULT 5.00,
    quality_score DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE farmers (
    farmer_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    supplier_id BIGINT UNSIGNED NOT NULL,
    farmer_full_name VARCHAR(120) NOT NULL,
    national_id VARCHAR(50),
    years_experience INT UNSIGNED DEFAULT 10,
    is_certified_organic BOOLEAN NOT NULL DEFAULT FALSE,
    certification_body VARCHAR(100),
    contact_phone VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_farmer_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (supplier_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE orchards (
    orchard_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    farmer_id BIGINT UNSIGNED NOT NULL,
    orchard_name VARCHAR(120) NOT NULL,
    gps_latitude DECIMAL(10,8),
    gps_longitude DECIMAL(11,8),
    total_area_hectares DECIMAL(8,2) NOT NULL,
    soil_type VARCHAR(60),
    irrigation_system VARCHAR(80),
    altitude_meters INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orchard_farmer FOREIGN KEY (farmer_id) REFERENCES farmers (farmer_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. MASTER DATA: CUSTOMERS & CLIENT SEGMENTS
-- ---------------------------------------------------------------------

CREATE TABLE customers (
    customer_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_code VARCHAR(30) NOT NULL UNIQUE,
    business_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    customer_category ENUM('RETAIL_SUPERMARKET', 'WHOLESALE_BUYER', 'DISTRIBUTOR', 'EXPORTER', 'FOOD_PROCESSOR') NOT NULL,
    tax_id VARCHAR(50),
    email VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    billing_address TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    credit_limit DECIMAL(15,2) NOT NULL DEFAULT 50000.00,
    current_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    discount_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    payment_terms_days INT UNSIGNED NOT NULL DEFAULT 15,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. MASTER DATA: FRUIT CATALOG, VARIETIES, GRADES & UNITS
-- ---------------------------------------------------------------------

CREATE TABLE fruit_categories (
    category_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(80) NOT NULL,
    description TEXT,
    climate_zone VARCHAR(60),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE units_of_measure (
    uom_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    base_unit VARCHAR(20) NOT NULL,
    conversion_factor DECIMAL(12,4) NOT NULL DEFAULT 1.0000,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE unit_conversions (
    conversion_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    from_uom_id BIGINT UNSIGNED NOT NULL,
    to_uom_id BIGINT UNSIGNED NOT NULL,
    multiplier DECIMAL(14,6) NOT NULL,
    description VARCHAR(100),
    CONSTRAINT fk_uc_from FOREIGN KEY (from_uom_id) REFERENCES units_of_measure (uom_id) ON DELETE RESTRICT,
    CONSTRAINT fk_uc_to FOREIGN KEY (to_uom_id) REFERENCES units_of_measure (uom_id) ON DELETE RESTRICT,
    UNIQUE KEY uq_uom_conversion (from_uom_id, to_uom_id)
) ENGINE=InnoDB;

CREATE TABLE fruit_products (
    product_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(40) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    variety VARCHAR(80) NOT NULL,
    origin_country VARCHAR(60) NOT NULL,
    primary_uom_id BIGINT UNSIGNED NOT NULL,
    standard_cost DECIMAL(15,2) NOT NULL,
    wholesale_price DECIMAL(15,2) NOT NULL,
    retail_price DECIMAL(15,2) NOT NULL,
    optimal_temp_celsius_min DECIMAL(4,1) NOT NULL DEFAULT 2.0,
    optimal_temp_celsius_max DECIMAL(4,1) NOT NULL DEFAULT 6.0,
    optimal_humidity_pct_min DECIMAL(4,1) NOT NULL DEFAULT 85.0,
    optimal_humidity_pct_max DECIMAL(4,1) NOT NULL DEFAULT 95.0,
    expected_shelf_life_days INT UNSIGNED NOT NULL DEFAULT 14,
    minimum_stock_threshold DECIMAL(12,2) NOT NULL DEFAULT 500.00,
    reorder_quantity DECIMAL(12,2) NOT NULL DEFAULT 2000.00,
    harvest_season VARCHAR(100),
    image_url VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_fp_category FOREIGN KEY (category_id) REFERENCES fruit_categories (category_id) ON DELETE RESTRICT,
    CONSTRAINT fk_fp_uom FOREIGN KEY (primary_uom_id) REFERENCES units_of_measure (uom_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE fruit_varieties (
    variety_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    variety_code VARCHAR(30) NOT NULL,
    variety_name VARCHAR(80) NOT NULL,
    sweetness_brix_target DECIMAL(4,1),
    firmness_kgf DECIMAL(4,2),
    skin_color_profile VARCHAR(80),
    CONSTRAINT fk_fv_product FOREIGN KEY (product_id) REFERENCES fruit_products (product_id) ON DELETE CASCADE,
    UNIQUE KEY uq_prod_variety (product_id, variety_code)
) ENGINE=InnoDB;

CREATE TABLE fruit_grades (
    grade_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    grade_code VARCHAR(20) NOT NULL UNIQUE,
    grade_name VARCHAR(60) NOT NULL,
    min_caliber_mm DECIMAL(5,2),
    max_blemish_percentage DECIMAL(4,2),
    price_multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.00
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. MASTER DATA: WAREHOUSES & STORAGE INFRASTRUCTURE
-- ---------------------------------------------------------------------

CREATE TABLE warehouses (
    warehouse_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    warehouse_code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    warehouse_type ENUM('COLD_STORAGE', 'CONTROLLED_ATMOSPHERE', 'RIPENING_CHAMBER', 'DISTRIBUTION_CENTER', 'PACKHOUSE') NOT NULL,
    address VARCHAR(200) NOT NULL,
    city VARCHAR(80) NOT NULL,
    state VARCHAR(80),
    country VARCHAR(80) NOT NULL,
    total_capacity_metric_tons DECIMAL(12,2) NOT NULL,
    current_occupancy_metric_tons DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    target_temperature_celsius DECIMAL(4,1) NOT NULL DEFAULT 3.0,
    target_humidity_percent DECIMAL(4,1) NOT NULL DEFAULT 90.0,
    is_operational BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE warehouse_zones (
    zone_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    warehouse_id BIGINT UNSIGNED NOT NULL,
    zone_code VARCHAR(30) NOT NULL,
    zone_name VARCHAR(80) NOT NULL,
    zone_type ENUM('PRE_COOLING', 'DEEP_CHILL', 'STANDARD_COLD', 'RIPENING', 'STAGING') NOT NULL,
    max_capacity_kg DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_wz_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (warehouse_id) ON DELETE CASCADE,
    UNIQUE KEY uq_wh_zone (warehouse_id, zone_code)
) ENGINE=InnoDB;

CREATE TABLE storage_locations (
    location_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    zone_id BIGINT UNSIGNED NOT NULL,
    rack_code VARCHAR(20) NOT NULL,
    shelf_level VARCHAR(10) NOT NULL,
    bin_number VARCHAR(10) NOT NULL,
    max_weight_kg DECIMAL(10,2) NOT NULL,
    is_occupied BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_sl_zone FOREIGN KEY (zone_id) REFERENCES warehouse_zones (zone_id) ON DELETE CASCADE,
    UNIQUE KEY uq_location (zone_id, rack_code, shelf_level, bin_number)
) ENGINE=InnoDB;

CREATE TABLE vehicles (
    vehicle_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    plate_number VARCHAR(30) NOT NULL UNIQUE,
    model VARCHAR(80) NOT NULL,
    vehicle_type ENUM('REEFER_TRUCK_40FT', 'REEFER_TRUCK_20FT', 'COLD_VAN', 'FLATBED') NOT NULL,
    cooling_unit_make VARCHAR(60),
    min_temp_capacity DECIMAL(4,1) NOT NULL DEFAULT -5.0,
    max_payload_kg DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE drivers (
    driver_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    phone VARCHAR(30) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE transport_companies (
    transport_company_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(120) NOT NULL,
    tax_code VARCHAR(50),
    contact_phone VARCHAR(30) NOT NULL,
    email VARCHAR(120),
    insurance_policy_number VARCHAR(80),
    is_certified_cold_chain BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. PROCUREMENT WORKFLOW
-- ---------------------------------------------------------------------

CREATE TABLE purchase_requisitions (
    requisition_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    requisition_number VARCHAR(40) NOT NULL UNIQUE,
    requested_by_user_id BIGINT UNSIGNED NOT NULL,
    required_by_date DATE NOT NULL,
    status ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'ORDERED') NOT NULL DEFAULT 'DRAFT',
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pr_user FOREIGN KEY (requested_by_user_id) REFERENCES users (user_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE purchase_requisition_items (
    requisition_item_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    requisition_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity DECIMAL(12,2) NOT NULL,
    uom_id BIGINT UNSIGNED NOT NULL,
    estimated_unit_cost DECIMAL(15,2),
    CONSTRAINT fk_pri_req FOREIGN KEY (requisition_id) REFERENCES purchase_requisitions (requisition_id) ON DELETE CASCADE,
    CONSTRAINT fk_pri_prod FOREIGN KEY (product_id) REFERENCES fruit_products (product_id) ON DELETE RESTRICT,
    CONSTRAINT fk_pri_uom FOREIGN KEY (uom_id) REFERENCES units_of_measure (uom_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE purchase_orders (
    purchase_order_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    po_number VARCHAR(40) NOT NULL UNIQUE,
    supplier_id BIGINT UNSIGNED NOT NULL,
    warehouse_id BIGINT UNSIGNED NOT NULL,
    order_date DATE NOT NULL,
    expected_delivery_date DATE NOT NULL,
    status ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PARTIALLY_RECEIVED', 'FULLY_RECEIVED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    grand_total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    created_by_user_id BIGINT UNSIGNED NOT NULL,
    approved_by_user_id BIGINT UNSIGNED,
    approved_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_po_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (supplier_id) ON DELETE RESTRICT,
    CONSTRAINT fk_po_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (warehouse_id) ON DELETE RESTRICT,
    CONSTRAINT fk_po_creator FOREIGN KEY (created_by_user_id) REFERENCES users (user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_po_approver FOREIGN KEY (approved_by_user_id) REFERENCES users (user_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE purchase_order_items (
    po_item_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    purchase_order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    grade_id BIGINT UNSIGNED NOT NULL,
    quantity_ordered DECIMAL(12,2) NOT NULL,
    quantity_received DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    uom_id BIGINT UNSIGNED NOT NULL,
    unit_purchase_price DECIMAL(15,2) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL,
    CONSTRAINT fk_poi_po FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders (purchase_order_id) ON DELETE CASCADE,
    CONSTRAINT fk_poi_prod FOREIGN KEY (product_id) REFERENCES fruit_products (product_id) ON DELETE RESTRICT,
    CONSTRAINT fk_poi_grade FOREIGN KEY (grade_id) REFERENCES fruit_grades (grade_id) ON DELETE RESTRICT,
    CONSTRAINT fk_poi_uom FOREIGN KEY (uom_id) REFERENCES units_of_measure (uom_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE goods_receipts (
    receipt_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    receipt_number VARCHAR(40) NOT NULL UNIQUE,
    purchase_order_id BIGINT UNSIGNED NOT NULL,
    warehouse_id BIGINT UNSIGNED NOT NULL,
    received_by_user_id BIGINT UNSIGNED NOT NULL,
    carrier_vehicle_plate VARCHAR(40),
    delivery_note_ref VARCHAR(80),
    received_at DATETIME NOT NULL,
    remarks TEXT,
    CONSTRAINT fk_gr_po FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders (purchase_order_id) ON DELETE RESTRICT,
    CONSTRAINT fk_gr_wh FOREIGN KEY (warehouse_id) REFERENCES warehouses (warehouse_id) ON DELETE RESTRICT,
    CONSTRAINT fk_gr_user FOREIGN KEY (received_by_user_id) REFERENCES users (user_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE goods_receipt_items (
    receipt_item_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    receipt_id BIGINT UNSIGNED NOT NULL,
    po_item_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity_received DECIMAL(12,2) NOT NULL,
    quantity_accepted DECIMAL(12,2) NOT NULL,
    quantity_rejected DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    uom_id BIGINT UNSIGNED NOT NULL,
    rejection_reason VARCHAR(255),
    CONSTRAINT fk_gri_receipt FOREIGN KEY (receipt_id) REFERENCES goods_receipts (receipt_id) ON DELETE CASCADE,
    CONSTRAINT fk_gri_poi FOREIGN KEY (po_item_id) REFERENCES purchase_order_items (po_item_id) ON DELETE RESTRICT,
    CONSTRAINT fk_gri_prod FOREIGN KEY (product_id) REFERENCES fruit_products (product_id) ON DELETE RESTRICT,
    CONSTRAINT fk_gri_uom FOREIGN KEY (uom_id) REFERENCES units_of_measure (uom_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE supplier_invoices (
    invoice_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_id BIGINT UNSIGNED NOT NULL,
    purchase_order_id BIGINT UNSIGNED NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    payment_status ENUM('UNPAID', 'PARTIALLY_PAID', 'PAID', 'CANCELLED') NOT NULL DEFAULT 'UNPAID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_si_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (supplier_id) ON DELETE RESTRICT,
    CONSTRAINT fk_si_po FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders (purchase_order_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE supplier_invoice_items (
    invoice_item_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity DECIMAL(12,2) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    line_total DECIMAL(15,2) NOT NULL,
    CONSTRAINT fk_sii_inv FOREIGN KEY (invoice_id) REFERENCES supplier_invoices (invoice_id) ON DELETE CASCADE,
    CONSTRAINT fk_sii_prod FOREIGN KEY (product_id) REFERENCES fruit_products (product_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE payment_methods (
    payment_method_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    method_code VARCHAR(30) NOT NULL UNIQUE,
    method_name VARCHAR(60) NOT NULL,
    is_electronic BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE supplier_payments (
    payment_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    payment_reference VARCHAR(50) NOT NULL UNIQUE,
    supplier_invoice_id BIGINT UNSIGNED NOT NULL,
    payment_method_id BIGINT UNSIGNED NOT NULL,
    amount_paid DECIMAL(15,2) NOT NULL,
    payment_date DATE NOT NULL,
    bank_transaction_id VARCHAR(100),
    processed_by_user_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sp_inv FOREIGN KEY (supplier_invoice_id) REFERENCES supplier_invoices (invoice_id) ON DELETE RESTRICT,
    CONSTRAINT fk_sp_pm FOREIGN KEY (payment_method_id) REFERENCES payment_methods (payment_method_id) ON DELETE RESTRICT,
    CONSTRAINT fk_sp_user FOREIGN KEY (processed_by_user_id) REFERENCES users (user_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. INVENTORY & PERISHABLE BATCH MANAGEMENT (FEFO/FIFO)
-- ---------------------------------------------------------------------

CREATE TABLE inventory_batches (
    batch_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_number VARCHAR(50) NOT NULL UNIQUE,
    product_id BIGINT UNSIGNED NOT NULL,
    supplier_id BIGINT UNSIGNED NOT NULL,
    purchase_order_id BIGINT UNSIGNED,
    warehouse_id BIGINT UNSIGNED NOT NULL,
    storage_location_id BIGINT UNSIGNED,
    grade_id BIGINT UNSIGNED NOT NULL,
    harvest_date DATE,
    received_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    initial_quantity DECIMAL(12,2) NOT NULL,
    quantity_available DECIMAL(12,2) NOT NULL,
    quantity_reserved DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    quantity_damaged DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    unit_cost DECIMAL(15,2) NOT NULL,
    qc_status ENUM('PASSED', 'PENDING', 'QUARANTINED', 'REJECTED') NOT NULL DEFAULT 'PASSED',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ib_prod FOREIGN KEY (product_id) REFERENCES fruit_products (product_id) ON DELETE RESTRICT,
    CONSTRAINT fk_ib_sup FOREIGN KEY (supplier_id) REFERENCES suppliers (supplier_id) ON DELETE RESTRICT,
    CONSTRAINT fk_ib_wh FOREIGN KEY (warehouse_id) REFERENCES warehouses (warehouse_id) ON DELETE RESTRICT,
    CONSTRAINT fk_ib_loc FOREIGN KEY (storage_location_id) REFERENCES storage_locations (location_id) ON DELETE SET NULL,
    CONSTRAINT fk_ib_grade FOREIGN KEY (grade_id) REFERENCES fruit_grades (grade_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE inventory_balances (
    balance_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    warehouse_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    total_physical_quantity DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_reserved_quantity DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_available_quantity DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    last_reconciled_at DATETIME,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ibal_wh FOREIGN KEY (warehouse_id) REFERENCES warehouses (warehouse_id) ON DELETE RESTRICT,
    CONSTRAINT fk_ibal_prod FOREIGN KEY (product_id) REFERENCES fruit_products (product_id) ON DELETE RESTRICT,
    UNIQUE KEY uq_wh_product (warehouse_id, product_id)
) ENGINE=InnoDB;

CREATE TABLE inventory_movements (
    movement_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    movement_uuid VARCHAR(36) NOT NULL UNIQUE,
    batch_id BIGINT UNSIGNED NOT NULL,
    movement_type ENUM('INBOUND_RECEIPT', 'OUTBOUND_SALE', 'TRANSFER_OUT', 'TRANSFER_IN', 'QC_SPOILAGE_LOSS', 'MANUAL_ADJUSTMENT', 'RETURN_RESTOCK') NOT NULL,
    source_warehouse_id BIGINT UNSIGNED,
    destination_warehouse_id BIGINT UNSIGNED,
    quantity DECIMAL(12,2) NOT NULL,
    balance_after DECIMAL(12,2) NOT NULL,
    reference_order_type VARCHAR(50),
    reference_order_id BIGINT UNSIGNED,
    performed_by_user_id BIGINT UNSIGNED NOT NULL,
    movement_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks VARCHAR(255),
    CONSTRAINT fk_im_batch FOREIGN KEY (batch_id) REFERENCES inventory_batches (batch_id) ON DELETE RESTRICT,
    CONSTRAINT fk_im_src_wh FOREIGN KEY (source_warehouse_id) REFERENCES warehouses (warehouse_id) ON DELETE RESTRICT,
    CONSTRAINT fk_im_dst_wh FOREIGN KEY (destination_warehouse_id) REFERENCES warehouses (warehouse_id) ON DELETE RESTRICT,
    CONSTRAINT fk_im_user FOREIGN KEY (performed_by_user_id) REFERENCES users (user_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE stock_adjustments (
    adjustment_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    adjustment_number VARCHAR(40) NOT NULL UNIQUE,
    warehouse_id BIGINT UNSIGNED NOT NULL,
    adjustment_reason ENUM('INVENTORY_AUDIT', 'DAMAGE_UNUSABLE', 'THEFT_LOSS', 'DATA_ENTRY_ERROR', 'COLD_CHAIN_SPOILAGE') NOT NULL,
    authorized_by_user_id BIGINT UNSIGNED NOT NULL,
    adjustment_date DATE NOT NULL,
    status ENUM('SUBMITTED', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'APPROVED',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sa_wh FOREIGN KEY (warehouse_id) REFERENCES warehouses (warehouse_id) ON DELETE RESTRICT,
    CONSTRAINT fk_sa_user FOREIGN KEY (authorized_by_user_id) REFERENCES users (user_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE stock_adjustment_items (
    adj_item_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    adjustment_id BIGINT UNSIGNED NOT NULL,
    batch_id BIGINT UNSIGNED NOT NULL,
    quantity_delta DECIMAL(12,2) NOT NULL,
    cost_impact DECIMAL(15,2) NOT NULL,
    CONSTRAINT fk_sai_adj FOREIGN KEY (adjustment_id) REFERENCES stock_adjustments (adjustment_id) ON DELETE CASCADE,
    CONSTRAINT fk_sai_batch FOREIGN KEY (batch_id) REFERENCES inventory_batches (batch_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE stock_transfers (
    transfer_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    transfer_number VARCHAR(40) NOT NULL UNIQUE,
    source_warehouse_id BIGINT UNSIGNED NOT NULL,
    destination_warehouse_id BIGINT UNSIGNED NOT NULL,
    transfer_status ENUM('REQUESTED', 'APPROVED', 'IN_TRANSIT', 'RECEIVED', 'REJECTED') NOT NULL DEFAULT 'REQUESTED',
    initiated_by_user_id BIGINT UNSIGNED NOT NULL,
    departure_date DATETIME,
    arrival_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_st_src FOREIGN KEY (source_warehouse_id) REFERENCES warehouses (warehouse_id) ON DELETE RESTRICT,
    CONSTRAINT fk_st_dst FOREIGN KEY (destination_warehouse_id) REFERENCES warehouses (warehouse_id) ON DELETE RESTRICT,
    CONSTRAINT fk_st_user FOREIGN KEY (initiated_by_user_id) REFERENCES users (user_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE stock_transfer_items (
    transfer_item_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    transfer_id BIGINT UNSIGNED NOT NULL,
    batch_id BIGINT UNSIGNED NOT NULL,
    quantity_shipped DECIMAL(12,2) NOT NULL,
    quantity_received DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_sti_transfer FOREIGN KEY (transfer_id) REFERENCES stock_transfers (transfer_id) ON DELETE CASCADE,
    CONSTRAINT fk_sti_batch FOREIGN KEY (batch_id) REFERENCES inventory_batches (batch_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE inventory_reservations (
    reservation_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reservation_code VARCHAR(40) NOT NULL UNIQUE,
    reference_sales_order_id BIGINT UNSIGNED NOT NULL,
    expires_at DATETIME NOT NULL,
    status ENUM('ACTIVE', 'RELEASED', 'FULFILLED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE inventory_reservation_items (
    res_item_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reservation_id BIGINT UNSIGNED NOT NULL,
    batch_id BIGINT UNSIGNED NOT NULL,
    reserved_quantity DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_iri_res FOREIGN KEY (reservation_id) REFERENCES inventory_reservations (reservation_id) ON DELETE CASCADE,
    CONSTRAINT fk_iri_batch FOREIGN KEY (batch_id) REFERENCES inventory_batches (batch_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 8. QUALITY CONTROL & SPOILAGE MANAGEMENT
-- ---------------------------------------------------------------------

CREATE TABLE quality_inspections (
    inspection_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    inspection_code VARCHAR(40) NOT NULL UNIQUE,
    batch_id BIGINT UNSIGNED NOT NULL,
    inspector_user_id BIGINT UNSIGNED NOT NULL,
    inspection_type ENUM('INCOMING_RECEIPT', 'COLD_STORAGE_ROUTINE', 'PRE_DISPATCH_AUDIT') NOT NULL,
    brix_sweetness_reading DECIMAL(4,1),
    pulp_firmness_pressure_kg DECIMAL(4,2),
    skin_color_rating VARCHAR(40),
    sample_weight_kg DECIMAL(8,2) NOT NULL,
    defective_sample_weight_kg DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    inspection_verdict ENUM('PASSED_PREMIUM', 'PASSED_STANDARD', 'DOWNGRADED', 'REJECTED') NOT NULL,
    inspected_at DATETIME NOT NULL,
    notes TEXT,
    CONSTRAINT fk_qi_batch FOREIGN KEY (batch_id) REFERENCES inventory_batches (batch_id) ON DELETE RESTRICT,
    CONSTRAINT fk_qi_user FOREIGN KEY (inspector_user_id) REFERENCES users (user_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE quality_inspection_items (
    qi_item_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    inspection_id BIGINT UNSIGNED NOT NULL,
    parameter_name VARCHAR(80) NOT NULL,
    measured_value VARCHAR(100) NOT NULL,
    tolerance_standard VARCHAR(100) NOT NULL,
    is_compliant BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_qii_inspection FOREIGN KEY (inspection_id) REFERENCES quality_inspections (inspection_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE spoilage_reasons (
    reason_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reason_code VARCHAR(40) NOT NULL UNIQUE,
    reason_name VARCHAR(100) NOT NULL,
    description TEXT
) ENGINE=InnoDB;

CREATE TABLE spoilage_records (
    spoilage_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    spoilage_number VARCHAR(40) NOT NULL UNIQUE,
    batch_id BIGINT UNSIGNED NOT NULL,
    reason_id BIGINT UNSIGNED NOT NULL,
    quantity_spoiled DECIMAL(12,2) NOT NULL,
    uom_id BIGINT UNSIGNED NOT NULL,
    unit_cost DECIMAL(15,2) NOT NULL,
    total_financial_loss DECIMAL(15,2) NOT NULL,
    spoilage_percentage DECIMAL(5,2) NOT NULL,
    action_taken ENUM('COMPOSTED', 'DESTROYED', 'SOLD_TO_BIOFUEL', 'RETURNED_TO_GROWER') NOT NULL,
    reported_by_user_id BIGINT UNSIGNED NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sr_batch FOREIGN KEY (batch_id) REFERENCES inventory_batches (batch_id) ON DELETE RESTRICT,
    CONSTRAINT fk_sr_reason FOREIGN KEY (reason_id) REFERENCES spoilage_reasons (reason_id) ON DELETE RESTRICT,
    CONSTRAINT fk_sr_uom FOREIGN KEY (uom_id) REFERENCES units_of_measure (uom_id) ON DELETE RESTRICT,
    CONSTRAINT fk_sr_user FOREIGN KEY (reported_by_user_id) REFERENCES users (user_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE temperature_logs (
    log_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    warehouse_id BIGINT UNSIGNED NOT NULL,
    zone_id BIGINT UNSIGNED,
    sensor_hardware_id VARCHAR(50) NOT NULL,
    recorded_temp_celsius DECIMAL(4,1) NOT NULL,
    recorded_humidity_percent DECIMAL(4,1) NOT NULL,
    is_threshold_breach BOOLEAN NOT NULL DEFAULT FALSE,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tl_wh FOREIGN KEY (warehouse_id) REFERENCES warehouses (warehouse_id) ON DELETE RESTRICT,
    CONSTRAINT fk_tl_zone FOREIGN KEY (zone_id) REFERENCES warehouse_zones (zone_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE quality_certificates (
    certificate_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    certificate_number VARCHAR(60) NOT NULL UNIQUE,
    inspection_id BIGINT UNSIGNED NOT NULL,
    certifying_agency VARCHAR(100) NOT NULL,
    issued_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    certificate_document_url VARCHAR(255),
    CONSTRAINT fk_qc_insp FOREIGN KEY (inspection_id) REFERENCES quality_inspections (inspection_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 9. SALES & ORDER FULFILLMENT WORKFLOW
-- ---------------------------------------------------------------------

CREATE TABLE sales_orders (
    sales_order_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    so_number VARCHAR(40) NOT NULL UNIQUE,
    customer_id BIGINT UNSIGNED NOT NULL,
    order_date DATE NOT NULL,
    required_dispatch_date DATE NOT NULL,
    order_status ENUM('DRAFT', 'CONFIRMED', 'PROCESSING', 'PACKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED', 'RETURNED') NOT NULL DEFAULT 'DRAFT',
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    created_by_user_id BIGINT UNSIGNED NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_so_customer FOREIGN KEY (customer_id) REFERENCES customers (customer_id) ON DELETE RESTRICT,
    CONSTRAINT fk_so_creator FOREIGN KEY (created_by_user_id) REFERENCES users (user_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE sales_order_items (
    so_item_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sales_order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    grade_id BIGINT UNSIGNED NOT NULL,
    quantity_ordered DECIMAL(12,2) NOT NULL,
    quantity_allocated DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    quantity_fulfilled DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    uom_id BIGINT UNSIGNED NOT NULL,
    unit_selling_price DECIMAL(15,2) NOT NULL,
    line_total DECIMAL(15,2) NOT NULL,
    CONSTRAINT fk_soi_so FOREIGN KEY (sales_order_id) REFERENCES sales_orders (sales_order_id) ON DELETE CASCADE,
    CONSTRAINT fk_soi_prod FOREIGN KEY (product_id) REFERENCES fruit_products (product_id) ON DELETE RESTRICT,
    CONSTRAINT fk_soi_grade FOREIGN KEY (grade_id) REFERENCES fruit_grades (grade_id) ON DELETE RESTRICT,
    CONSTRAINT fk_soi_uom FOREIGN KEY (uom_id) REFERENCES units_of_measure (uom_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE sales_order_allocations (
    allocation_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    so_item_id BIGINT UNSIGNED NOT NULL,
    batch_id BIGINT UNSIGNED NOT NULL,
    allocated_quantity DECIMAL(12,2) NOT NULL,
    allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_fefo_allocated BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_soa_soi FOREIGN KEY (so_item_id) REFERENCES sales_order_items (so_item_id) ON DELETE CASCADE,
    CONSTRAINT fk_soa_batch FOREIGN KEY (batch_id) REFERENCES inventory_batches (batch_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE sales_invoices (
    sales_invoice_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    sales_order_id BIGINT UNSIGNED NOT NULL,
    customer_id BIGINT UNSIGNED NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    payment_status ENUM('UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED') NOT NULL DEFAULT 'UNPAID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sinv_so FOREIGN KEY (sales_order_id) REFERENCES sales_orders (sales_order_id) ON DELETE RESTRICT,
    CONSTRAINT fk_sinv_cust FOREIGN KEY (customer_id) REFERENCES customers (customer_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE sales_invoice_items (
    sales_inv_item_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sales_invoice_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity DECIMAL(12,2) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    line_total DECIMAL(15,2) NOT NULL,
    CONSTRAINT fk_sii_salesinv FOREIGN KEY (sales_invoice_id) REFERENCES sales_invoices (sales_invoice_id) ON DELETE CASCADE,
    CONSTRAINT fk_sii_saleprod FOREIGN KEY (product_id) REFERENCES fruit_products (product_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE customer_payments (
    payment_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    receipt_reference VARCHAR(50) NOT NULL UNIQUE,
    sales_invoice_id BIGINT UNSIGNED NOT NULL,
    customer_id BIGINT UNSIGNED NOT NULL,
    payment_method_id BIGINT UNSIGNED NOT NULL,
    amount_paid DECIMAL(15,2) NOT NULL,
    payment_date DATE NOT NULL,
    bank_reference VARCHAR(100),
    received_by_user_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cp_invoice FOREIGN KEY (sales_invoice_id) REFERENCES sales_invoices (sales_invoice_id) ON DELETE RESTRICT,
    CONSTRAINT fk_cp_cust FOREIGN KEY (customer_id) REFERENCES customers (customer_id) ON DELETE RESTRICT,
    CONSTRAINT fk_cp_pm FOREIGN KEY (payment_method_id) REFERENCES payment_methods (payment_method_id) ON DELETE RESTRICT,
    CONSTRAINT fk_cp_user FOREIGN KEY (received_by_user_id) REFERENCES users (user_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE sales_returns (
    return_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    return_number VARCHAR(40) NOT NULL UNIQUE,
    sales_order_id BIGINT UNSIGNED NOT NULL,
    customer_id BIGINT UNSIGNED NOT NULL,
    return_reason ENUM('OVER_RIPE_DEFECT', 'TEMPERATURE_ABUSE', 'PACKAGE_CRUSH', 'INCORRECT_GRADE') NOT NULL,
    status ENUM('REQUESTED', 'APPROVED', 'RESTOCKED', 'REJECTED') NOT NULL DEFAULT 'REQUESTED',
    refund_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_srn_so FOREIGN KEY (sales_order_id) REFERENCES sales_orders (sales_order_id) ON DELETE RESTRICT,
    CONSTRAINT fk_srn_cust FOREIGN KEY (customer_id) REFERENCES customers (customer_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE sales_return_items (
    return_item_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    return_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity_returned DECIMAL(12,2) NOT NULL,
    restockable_quantity DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    waste_quantity DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_sri_ret FOREIGN KEY (return_id) REFERENCES sales_returns (return_id) ON DELETE CASCADE,
    CONSTRAINT fk_sri_prod FOREIGN KEY (product_id) REFERENCES fruit_products (product_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 10. LOGISTICS & COLD-CHAIN FLEET DISTRIBUTION
-- ---------------------------------------------------------------------

CREATE TABLE delivery_routes (
    route_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    route_code VARCHAR(30) NOT NULL UNIQUE,
    route_name VARCHAR(100) NOT NULL,
    origin_city VARCHAR(80) NOT NULL,
    destination_city VARCHAR(80) NOT NULL,
    estimated_distance_km DECIMAL(8,2) NOT NULL,
    standard_duration_hours DECIMAL(4,1) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE route_stops (
    stop_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    route_id BIGINT UNSIGNED NOT NULL,
    stop_sequence INT UNSIGNED NOT NULL,
    location_name VARCHAR(100) NOT NULL,
    estimated_wait_time_minutes INT UNSIGNED DEFAULT 30,
    CONSTRAINT fk_rs_route FOREIGN KEY (route_id) REFERENCES delivery_routes (route_id) ON DELETE CASCADE,
    UNIQUE KEY uq_route_seq (route_id, stop_sequence)
) ENGINE=InnoDB;

CREATE TABLE shipments (
    shipment_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    shipment_number VARCHAR(40) NOT NULL UNIQUE,
    sales_order_id BIGINT UNSIGNED NOT NULL,
    vehicle_id BIGINT UNSIGNED NOT NULL,
    driver_id BIGINT UNSIGNED NOT NULL,
    route_id BIGINT UNSIGNED,
    planned_departure DATETIME NOT NULL,
    actual_departure DATETIME,
    estimated_delivery DATETIME NOT NULL,
    actual_delivery DATETIME,
    shipment_status ENUM('SCHEDULED', 'LOADING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED') NOT NULL DEFAULT 'SCHEDULED',
    target_temperature_celsius DECIMAL(4,1) NOT NULL DEFAULT 3.5,
    transport_cost DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    proof_of_delivery_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sh_so FOREIGN KEY (sales_order_id) REFERENCES sales_orders (sales_order_id) ON DELETE RESTRICT,
    CONSTRAINT fk_sh_veh FOREIGN KEY (vehicle_id) REFERENCES vehicles (vehicle_id) ON DELETE RESTRICT,
    CONSTRAINT fk_sh_drv FOREIGN KEY (driver_id) REFERENCES drivers (driver_id) ON DELETE RESTRICT,
    CONSTRAINT fk_sh_rt FOREIGN KEY (route_id) REFERENCES delivery_routes (route_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE shipment_items (
    shipment_item_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    shipment_id BIGINT UNSIGNED NOT NULL,
    batch_id BIGINT UNSIGNED NOT NULL,
    quantity_shipped DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_shi_sh FOREIGN KEY (shipment_id) REFERENCES shipments (shipment_id) ON DELETE CASCADE,
    CONSTRAINT fk_shi_batch FOREIGN KEY (batch_id) REFERENCES inventory_batches (batch_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE shipment_tracking_events (
    event_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    shipment_id BIGINT UNSIGNED NOT NULL,
    event_type ENUM('DISPATCHED', 'CHECKPOINT_REACHED', 'TEMP_ALERT_TRIGGERED', 'DELAY_ENCOUNTERED', 'DELIVERED') NOT NULL,
    gps_latitude DECIMAL(10,8),
    gps_longitude DECIMAL(11,8),
    current_temp_celsius DECIMAL(4,1),
    event_description VARCHAR(255) NOT NULL,
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ste_sh FOREIGN KEY (shipment_id) REFERENCES shipments (shipment_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 11. FINANCE, EXPENSES & AUDIT LOGS
-- ---------------------------------------------------------------------

CREATE TABLE expense_categories (
    category_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(80) NOT NULL,
    description VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE expenses (
    expense_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    expense_number VARCHAR(40) NOT NULL UNIQUE,
    category_id BIGINT UNSIGNED NOT NULL,
    warehouse_id BIGINT UNSIGNED,
    amount DECIMAL(15,2) NOT NULL,
    expense_date DATE NOT NULL,
    vendor_payee VARCHAR(120) NOT NULL,
    description TEXT,
    recorded_by_user_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_exp_cat FOREIGN KEY (category_id) REFERENCES expense_categories (category_id) ON DELETE RESTRICT,
    CONSTRAINT fk_exp_wh FOREIGN KEY (warehouse_id) REFERENCES warehouses (warehouse_id) ON DELETE SET NULL,
    CONSTRAINT fk_exp_user FOREIGN KEY (recorded_by_user_id) REFERENCES users (user_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE accounts_payable (
    ap_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    supplier_id BIGINT UNSIGNED NOT NULL,
    supplier_invoice_id BIGINT UNSIGNED NOT NULL,
    amount_due DECIMAL(15,2) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('PENDING', 'PARTIAL', 'SETTLED', 'OVERDUE') NOT NULL DEFAULT 'PENDING',
    CONSTRAINT fk_ap_sup FOREIGN KEY (supplier_id) REFERENCES suppliers (supplier_id) ON DELETE RESTRICT,
    CONSTRAINT fk_ap_inv FOREIGN KEY (supplier_invoice_id) REFERENCES supplier_invoices (invoice_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE accounts_receivable (
    ar_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,
    sales_invoice_id BIGINT UNSIGNED NOT NULL,
    amount_due DECIMAL(15,2) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('PENDING', 'PARTIAL', 'SETTLED', 'OVERDUE') NOT NULL DEFAULT 'PENDING',
    CONSTRAINT fk_ar_cust FOREIGN KEY (customer_id) REFERENCES customers (customer_id) ON DELETE RESTRICT,
    CONSTRAINT fk_ar_inv FOREIGN KEY (sales_invoice_id) REFERENCES sales_invoices (sales_invoice_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
    log_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED,
    action VARCHAR(80) NOT NULL,
    entity_name VARCHAR(80) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE notifications (
    notification_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(120) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('LOW_STOCK', 'BATCH_EXPIRY', 'TEMP_ALARM', 'PO_APPROVAL', 'PAYMENT_RECEIVED') NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE system_settings (
    setting_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(80) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    setting_group VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
