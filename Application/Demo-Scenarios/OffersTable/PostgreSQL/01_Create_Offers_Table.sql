-- =============================================
-- Chinook Music Store - PostgreSQL Offers Table
-- =============================================
-- Creates an Offers table for demonstrating Flyway migrations
-- and the dynamic Offers tab functionality
-- =============================================

-- Drop table if it exists (for testing purposes)
DROP TABLE IF EXISTS offers CASCADE;

-- Create Offers table with sample structure
CREATE TABLE offers (
    offer_id SERIAL PRIMARY KEY,
    offer_name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_percent DECIMAL(5,2),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    category VARCHAR(100),
    minimum_purchase DECIMAL(10,2),
    max_uses INTEGER,
    times_used INTEGER DEFAULT 0,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'System'
);

-- Insert sample data
INSERT INTO offers (offer_name, description, discount_percent, start_date, end_date, is_active, category, minimum_purchase, max_uses, times_used)
VALUES 
    ('Rock Music Sale', 'Special discount on all rock albums', 15.00, '2025-01-01 00:00:00', '2025-12-31 23:59:59', TRUE, 'Music', 10.00, 1000, 45),
    ('Jazz Collection Offer', 'Buy 2 jazz albums, get 20% off', 20.00, '2025-02-01 00:00:00', '2025-11-30 23:59:59', TRUE, 'Music', 25.00, 500, 12),
    ('Classical Premium', 'Premium classical music discount for members', 25.00, '2025-01-15 00:00:00', '2025-06-15 23:59:59', TRUE, 'Classical', 50.00, 200, 8),
    ('New Customer Welcome', 'Welcome offer for first-time customers', 10.00, '2025-01-01 00:00:00', '2025-12-31 23:59:59', TRUE, 'Welcome', 0.00, NULL, 156),
    ('Summer Festival Deal', 'Festival season special pricing', 30.00, '2025-06-01 00:00:00', '2025-08-31 23:59:59', FALSE, 'Seasonal', 75.00, 100, 0),
    ('Metal Madness', 'Exclusive metal album collection discount', 18.00, '2025-03-01 00:00:00', '2025-09-30 23:59:59', TRUE, 'Metal', 15.00, 300, 67),
    ('Vinyl Revival', 'Special offer for vinyl record purchases', 12.00, '2025-01-01 00:00:00', '2025-12-31 23:59:59', TRUE, 'Vinyl', 30.00, 150, 23),
    ('PostgreSQL Power', 'Special PostgreSQL database music collection', 19.00, '2025-01-01 00:00:00', '2025-12-31 23:59:59', TRUE, 'Technology', 35.00, 400, 89);

-- Create indexes for better performance
CREATE INDEX idx_offers_active_category ON offers (is_active, category);
CREATE INDEX idx_offers_dates ON offers (start_date, end_date);
CREATE INDEX idx_offers_name ON offers (offer_name);

-- Display the created data
SELECT * FROM offers ORDER BY offer_id;

-- Show table structure
\d offers;

-- Display summary
SELECT 'PostgreSQL Offers table created successfully with ' || COUNT(*) || ' sample records.' AS result
FROM offers;

SELECT 'Use this table to test the dynamic Offers functionality in the Chinook WebApp.' AS note;

-- Show column information for verification
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'offers' 
ORDER BY ordinal_position;