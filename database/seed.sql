-- =====================================================================
-- FRUIT SUPPLY CHAIN MANAGEMENT SYSTEM - SEED DATA SCRIPT
-- Realistic Master Data, Fruit Catalog, Suppliers, Batches & Workflows
-- =====================================================================

USE fruit_supply_chain_db;

-- 1. Roles & Permissions
INSERT INTO roles (role_id, role_name, display_name, description) VALUES
(1, 'SUPER_ADMIN', 'Super Administrator', 'Complete system access and configuration control'),
(2, 'MANAGER', 'Supply Chain Director', 'Operational oversight, approvals, and executive BI reports'),
(3, 'PROCUREMENT_OFFICER', 'Procurement Specialist', 'Supplier contracting, purchase orders, and goods receipts'),
(4, 'WAREHOUSE_MANAGER', 'Cold Store Operations Manager', 'Inventory tracking, storage conditions, and stock transfers'),
(5, 'QUALITY_INSPECTOR', 'Chief Fruit Quality Inspector', 'Brix/firmness testing, grading, and spoilage logging'),
(6, 'SALES_MANAGER', 'Sales & Distribution Lead', 'Customer pricing, order fulfillment, and FEFO allocations'),
(7, 'ACCOUNTANT', 'Financial Controller', 'Accounts payable, receivable, and invoices'),
(8, 'LOGISTICS_MANAGER', 'Fleet & Cold-Chain Dispatcher', 'Reefer truck routing, GPS telemetry, and deliveries');

-- 2. Users (Bcrypt hashed dummy passwords)
INSERT INTO users (user_id, username, email, password_hash, first_name, last_name, phone) VALUES
(1, 'admin', 'admin@fruitsupply.internal', '$2a$12$e0MYzXyjpG8vWlQ8e8h.IeZ5Q1d5rO4B9eM6y6d5N7e1a0b3c4d5e', 'Elena', 'Vance', '+1-555-019-2831'),
(2, 'procure_officer', 'marcus.chen@fruitsupply.internal', '$2a$12$e0MYzXyjpG8vWlQ8e8h.IeZ5Q1d5rO4B9eM6y6d5N7e1a0b3c4d5e', 'Marcus', 'Chen', '+1-555-019-2832'),
(3, 'coldstore_mgr', 'sarah.jenkins@fruitsupply.internal', '$2a$12$e0MYzXyjpG8vWlQ8e8h.IeZ5Q1d5rO4B9eM6y6d5N7e1a0b3c4d5e', 'Sarah', 'Jenkins', '+1-555-019-2833'),
(4, 'qc_inspector', 'tariq.almansoor@fruitsupply.internal', '$2a$12$e0MYzXyjpG8vWlQ8e8h.IeZ5Q1d5rO4B9eM6y6d5N7e1a0b3c4d5e', 'Tariq', 'Al-Mansoor', '+1-555-019-2834');

INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1),
(2, 3),
(3, 4),
(4, 5);

-- 3. Units of Measure
INSERT INTO units_of_measure (uom_id, code, name, base_unit, conversion_factor) VALUES
(1, 'KG', 'Kilogram', 'KG', 1.0000),
(2, 'MT', 'Metric Ton', 'KG', 1000.0000),
(3, 'CRATE_15KG', '15kg Wooden Crate', 'KG', 15.0000),
(4, 'CARTON_10KG', '10kg Telescopic Box', 'KG', 10.0000),
(5, 'PUNNET_500G', '500g Clamshell Punnet', 'KG', 0.5000);

-- 4. Fruit Categories
INSERT INTO fruit_categories (category_id, code, name, description, climate_zone) VALUES
(1, 'TROPICAL', 'Tropical & Exotic', 'High respiration fruits requiring 10-13C or delicate chilled handling', 'Tropical/Subtropical'),
(2, 'CITRUS', 'Citrus Fruits', 'Thick rind fruits resilient to cold, 3-7C ideal', 'Mediterranean/Subtropical'),
(3, 'BERRIES', 'Delicate Berries', 'Highly perishable soft fruits requiring strict 0-2C cold chain', 'Temperate'),
(4, 'POMES', 'Pomes & Stone Fruits', 'Apples, pears, peaches needing precise humidity and ethylene control', 'Temperate/Mediterranean'),
(5, 'MELONS', 'Melons & Gourds', 'High water content fruits requiring 7-10C storage', 'Warm Arid/Tropical');

-- 5. Fruit Grades
INSERT INTO fruit_grades (grade_id, grade_code, grade_name, price_multiplier) VALUES
(1, 'GRADE_EXP', 'Export Premium Grade A+', 1.35),
(2, 'GRADE_A', 'Commercial Grade A', 1.00),
(3, 'GRADE_B', 'Domestic Grade B', 0.80),
(4, 'GRADE_PROC', 'Processing / Juice Grade', 0.50);

-- 6. Fruit Products (15 Hot-Selling Fruits)
INSERT INTO fruit_products (product_id, sku, name, category_id, variety, origin_country, primary_uom_id, standard_cost, wholesale_price, retail_price, optimal_temp_celsius_min, optimal_temp_celsius_max, optimal_humidity_pct_min, optimal_humidity_pct_max, expected_shelf_life_days, minimum_stock_threshold, reorder_quantity, harvest_season) VALUES
(1, 'FRT-MNG-ALPH', 'Alphonso Mangoes', 1, 'Alphonso', 'India', 3, 28.50, 42.00, 55.00, 10.0, 13.0, 85.0, 90.0, 14, 200, 800, 'March - June'),
(2, 'FRT-BAN-CAV', 'Cavendish Bananas', 1, 'Cavendish', 'Ecuador', 4, 9.20, 14.50, 19.90, 13.0, 14.5, 90.0, 95.0, 18, 500, 2500, 'Year-Round'),
(3, 'FRT-APP-HONEY', 'Honeycrisp Apples', 4, 'Honeycrisp', 'USA (Washington)', 4, 18.00, 26.50, 36.00, 0.5, 2.0, 90.0, 95.0, 60, 300, 1500, 'September - February'),
(4, 'FRT-ORA-VAL', 'Valencia Oranges', 2, 'Valencia', 'Spain (Valencia)', 4, 12.00, 18.00, 24.50, 3.0, 6.0, 85.0, 90.0, 45, 400, 2000, 'March - October'),
(5, 'FRT-GRP-THOMP', 'Thompson Seedless Grapes', 2, 'Thompson Seedless', 'Chile', 4, 16.50, 25.00, 34.00, -0.5, 1.0, 90.0, 95.0, 28, 250, 1200, 'November - April'),
(6, 'FRT-STR-CHAND', 'Chandler Strawberries', 3, 'Chandler', 'Mexico', 5, 1.80, 2.90, 4.50, 0.0, 2.0, 90.0, 95.0, 7, 600, 3000, 'January - May'),
(7, 'FRT-WAT-SUGAR', 'Sugar Baby Watermelons', 5, 'Sugar Baby', 'Morocco', 1, 0.45, 0.85, 1.30, 10.0, 12.0, 80.0, 85.0, 21, 2000, 8000, 'May - August'),
(8, 'FRT-POM-WOND', 'Wonderful Pomegranates', 2, 'Wonderful', 'Turkey (Antalya)', 4, 21.00, 31.00, 42.00, 5.0, 7.0, 85.0, 90.0, 40, 150, 700, 'September - January'),
(9, 'FRT-DAT-MEDJ', 'Premium Medjool Dates', 1, 'Medjool Large', 'Jordan Valley', 4, 45.00, 65.00, 89.00, 0.0, 4.0, 60.0, 65.0, 180, 100, 500, 'October - December'),
(10, 'FRT-AVO-HASS', 'Hass Avocados', 1, 'Hass Ready-to-Eat', 'Peru', 4, 22.00, 34.00, 48.00, 4.0, 6.0, 85.0, 90.0, 16, 350, 1800, 'May - September'),
(11, 'FRT-KIW-HAYW', 'Hayward Green Kiwis', 1, 'Hayward', 'New Zealand', 4, 17.50, 27.00, 37.50, 0.0, 1.0, 90.0, 95.0, 50, 200, 1000, 'May - November'),
(12, 'FRT-PIN-MD2', 'MD2 Extra Sweet Pineapples', 1, 'MD2 Golden Ripe', 'Costa Rica', 3, 14.00, 22.50, 31.00, 7.0, 10.0, 85.0, 90.0, 20, 200, 900, 'Year-Round'),
(13, 'FRT-PCH-ELB', 'Elberta Yellow Peaches', 4, 'Elberta', 'Italy', 4, 15.00, 23.50, 33.00, 0.0, 2.0, 90.0, 95.0, 12, 180, 900, 'June - September'),
(14, 'FRT-GUA-ALH', 'Safeda Guavas', 1, 'Allahabad Safeda', 'Egypt', 3, 11.50, 18.00, 25.00, 8.0, 10.0, 85.0, 90.0, 10, 120, 600, 'November - March'),
(15, 'FRT-PAP-REDL', 'Red Lady Papayas', 1, 'Red Lady Solo', 'Brazil', 3, 13.00, 21.00, 29.50, 10.0, 12.0, 85.0, 90.0, 14, 150, 750, 'Year-Round');

-- 7. Warehouses
INSERT INTO warehouses (warehouse_id, warehouse_code, name, warehouse_type, address, city, country, total_capacity_metric_tons, current_occupancy_metric_tons, target_temperature_celsius, target_humidity_percent) VALUES
(1, 'WH-ORD-01', 'Chicago Central Cold Hub', 'COLD_STORAGE', '1420 Cold Stream Parkway', 'Chicago', 'USA', 3500.00, 2140.00, 2.5, 90.0),
(2, 'WH-LAX-02', 'Long Beach Marine Cold Terminal', 'CONTROLLED_ATMOSPHERE', '88 Pier Harbor Terminal', 'Long Beach', 'USA', 5000.00, 3820.00, 4.0, 88.0),
(3, 'WH-ROT-03', 'Rotterdam Agro-Port Logistics', 'DISTRIBUTION_CENTER', 'Waalhaven Oostzijde 19', 'Rotterdam', 'Netherlands', 8000.00, 5290.00, 3.0, 92.0);

-- 8. Suppliers
INSERT INTO suppliers (supplier_id, supplier_code, name, supplier_type, email, phone, address_line1, city, country, sourcing_region, payment_terms_days, rating, quality_score) VALUES
(1, 'SUP-AGRO-IND', 'Konkan Orchards Export Co.', 'COOPERATIVE', 'sales@konkanmango.com', '+91-235-228-4411', 'Devgad Coastal Highway', 'Ratnagiri', 'India', 'Maharashtra & Goa Coast', 30, 4.90, 98.50),
(2, 'SUP-VAL-CITR', 'Sol de Valencia Citrus S.L.', 'COMMERCIAL_GROWER', 'orders@solvalencia.es', '+34-963-882-190', 'Camino del Huerto 12', 'Valencia', 'Spain', 'Levante Coastal Basin', 30, 4.85, 96.80),
(3, 'SUP-ECU-BAN', 'Guayas River Banana Growers', 'COMMERCIAL_GROWER', 'export@guayasbanana.ec', '+593-42-881-209', 'Km 14 Via a Daule', 'Guayaquil', 'Ecuador', 'Guayas River Delta', 15, 4.70, 94.20),
(4, 'SUP-PER-AVOC', 'Inca Prime Harvest S.A.C.', 'COMMERCIAL_GROWER', 'contact@incaprime.pe', '+51-1-482-9900', 'Panamericana Sur Km 298', 'Ica', 'Peru', 'Ica Valley Highlands', 30, 4.95, 99.10),
(5, 'SUP-MEX-BERR', 'Bajio Berry Farms Union', 'COOPERATIVE', 'info@bajioberry.mx', '+52-351-512-8900', 'Carretera Zamora-Jacona', 'Michoacan', 'Mexico', 'Zamora Valley', 15, 4.80, 95.40);

-- 9. Customers
INSERT INTO customers (customer_id, customer_code, business_name, contact_person, customer_category, email, phone, billing_address, shipping_address, credit_limit, current_balance, discount_percentage) VALUES
(1, 'CUST-METRO-01', 'Metro Fresh Supermarkets Inc.', 'Amanda Richardson', 'RETAIL_SUPERMARKET', 'arichardson@metrofresh.com', '+1-312-555-8120', '800 N Michigan Ave, Chicago IL', 'DC-9 Logistics Hub, Gary IN', 250000.00, 48200.00, 5.00),
(2, 'CUST-WHOLE-02', 'Great Lakes Agro Wholesalers', 'Dmitri Rostov', 'WHOLESALE_BUYER', 'd.rostov@greatlakesagro.com', '+1-216-555-4491', '1900 West 25th St, Cleveland OH', 'Terminal Whse 4, Cleveland OH', 150000.00, 32150.00, 8.00),
(3, 'CUST-EXPO-03', 'Nordic Fresh Import AB', 'Astrid Lindholm', 'EXPORTER', 'astrid@nordicfresh.se', '+46-8-555-3210', 'Frihamnen 12, Stockholm', 'Rotterdam Sea Pier Berth 7', 500000.00, 114500.00, 10.00);

-- 10. Payment Methods
INSERT INTO payment_methods (payment_method_id, method_code, method_name, is_electronic) VALUES
(1, 'SWIFT_WIRE', 'International SWIFT Wire Transfer', TRUE),
(2, 'ACH_TRANSFER', 'Automated Clearing House (ACH)', TRUE),
(3, 'LETTER_CREDIT', 'Irrevocable Letter of Credit (L/C)', TRUE),
(4, 'COMMERCIAL_CHECK', 'Bank Cashier Check', FALSE);

-- 11. Spoilage Reasons
INSERT INTO spoilage_reasons (reason_id, reason_code, reason_name, description) VALUES
(1, 'OVER_RIPENING', 'Senescence & Over-Ripening', 'Natural pulp softening and sugar collapse past marketable threshold'),
(2, 'TEMP_ABUSE', 'Cold-Chain Temperature Abuse', 'Excursion above target temperature causing cellular weeping or chilling injury'),
(3, 'TRANSIT_IMPACT', 'Mechanical & Transit Damage', 'Bruising, carton crush, or vibration friction damage during carriage'),
(4, 'FUNGAL_PATHOGEN', 'Fungal Infection / Mold Spores', 'Botrytis, anthracnose, or penicillium rot identified during storage'),
(5, 'ETHYLENE_EXPOSURE', 'Ethylene Gas Cross-Contamination', 'Unintentional exposure to banana/apple ripening gases accelerating decay');
