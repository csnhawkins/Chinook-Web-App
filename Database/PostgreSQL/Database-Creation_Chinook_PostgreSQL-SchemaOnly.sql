
/*******************************************************************************
   Chinook Database 
   Description: Creates and populates the Chinook database.
   DB Server: PostgreSql
   Original Author: Luis Rocha (Evolved by Chris Hawkins at Redgate Software Ltd)
   License: https://github.com/lerocha/chinook-database/blob/master/LICENSE.md
-------------------------------------------------------------------------------
   Version: 1.0.0
   Last Updated: 2026-02-05
   Update Notes: Added named constraints for all tables
********************************************************************************/

/*******************************************************************************
   Create Tables
********************************************************************************/
CREATE TABLE album
(
    album_id INT NOT NULL GENERATED ALWAYS AS IDENTITY,
    title VARCHAR(160) NOT NULL,
    artist_id INT NOT NULL,
    CONSTRAINT album_pkey PRIMARY KEY  (album_id)
);

CREATE TABLE artist
(
    artist_id INT NOT NULL GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(120),
    CONSTRAINT artist_pkey PRIMARY KEY  (artist_id)
);

CREATE TABLE customer
(
    customer_id INT NOT NULL GENERATED ALWAYS AS IDENTITY,
    first_name VARCHAR(40) NOT NULL,
    last_name VARCHAR(20) NOT NULL,
    company VARCHAR(80),
    address VARCHAR(70),
    city VARCHAR(40),
    state VARCHAR(40),
    country VARCHAR(40),
    postal_code VARCHAR(10),
    phone VARCHAR(24),
    fax VARCHAR(24),
    email VARCHAR(60) NOT NULL,
    support_rep_id INT,
    CONSTRAINT customer_pkey PRIMARY KEY  (customer_id)
);

CREATE TABLE employee
(
    employee_id INT NOT NULL GENERATED ALWAYS AS IDENTITY,
    last_name VARCHAR(20) NOT NULL,
    first_name VARCHAR(20) NOT NULL,
    title VARCHAR(30),
    reports_to INT,
    birth_date TIMESTAMP,
    hire_date TIMESTAMP,
    address VARCHAR(70),
    city VARCHAR(40),
    state VARCHAR(40),
    country VARCHAR(40),
    postal_code VARCHAR(10),
    phone VARCHAR(24),
    fax VARCHAR(24),
    email VARCHAR(60),
    CONSTRAINT employee_pkey PRIMARY KEY  (employee_id)
);

CREATE TABLE genre
(
    genre_id INT NOT NULL GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(120),
    CONSTRAINT genre_pkey PRIMARY KEY  (genre_id)
);

CREATE TABLE invoice
(
    invoice_id INT NOT NULL GENERATED ALWAYS AS IDENTITY,
    customer_id INT NOT NULL,
    invoice_date TIMESTAMP NOT NULL,
    billing_address VARCHAR(70),
    billing_city VARCHAR(40),
    billing_state VARCHAR(40),
    billing_country VARCHAR(40),
    billing_postal_code VARCHAR(10),
    total NUMERIC(10,2) NOT NULL,
    CONSTRAINT invoice_pkey PRIMARY KEY  (invoice_id)
);

CREATE TABLE invoice_line
(
    invoice_line_id INT NOT NULL GENERATED ALWAYS AS IDENTITY,
    invoice_id INT NOT NULL,
    track_id INT NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    quantity INT NOT NULL,
    CONSTRAINT invoice_line_pkey PRIMARY KEY  (invoice_line_id)
);

CREATE TABLE media_type
(
    media_type_id INT NOT NULL GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(120),
    CONSTRAINT media_type_pkey PRIMARY KEY  (media_type_id)
);

CREATE TABLE playlist
(
    playlist_id INT NOT NULL GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(120),
    CONSTRAINT playlist_pkey PRIMARY KEY  (playlist_id)
);

CREATE TABLE playlist_track
(
    playlist_id INT NOT NULL,
    track_id INT NOT NULL,
    CONSTRAINT playlist_track_pkey PRIMARY KEY  (playlist_id, track_id)
);

CREATE TABLE track
(
    track_id INT NOT NULL GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(200) NOT NULL,
    album_id INT,
    media_type_id INT NOT NULL,
    genre_id INT,
    composer VARCHAR(220),
    milliseconds INT NOT NULL,
    bytes INT,
    unit_price NUMERIC(10,2) NOT NULL,
    CONSTRAINT track_pkey PRIMARY KEY  (track_id)
);

-- track_review
CREATE TABLE track_review (
    review_id SERIAL NOT NULL,
    track_id INT NOT NULL,
    reviewer_name VARCHAR(100) NOT NULL,
    rating INT,
    review_text VARCHAR(1000),
    review_date DATE NOT NULL,
    CONSTRAINT ck_track_review_rating CHECK (rating BETWEEN 1 AND 5)
);


CREATE TABLE app_config (
    config_id SERIAL NOT NULL,
    config_key VARCHAR(50) NOT NULL,
    config_value VARCHAR(200) NOT NULL,
    CONSTRAINT pk_app_config PRIMARY KEY (config_id)
);

-- system_log
CREATE TABLE system_log (
    log_id SERIAL NOT NULL,
    invoice_id INT NOT NULL REFERENCES invoice(invoice_id),
    log_date TIMESTAMP NOT NULL,
    log_message TEXT,
    CONSTRAINT pk_system_log PRIMARY KEY (log_id)
);

/*******************************************************************************
   Create Primary Key Unique Indexes
********************************************************************************/

/*******************************************************************************
   Create Foreign Keys
********************************************************************************/
ALTER TABLE album ADD CONSTRAINT album_artist_id_fkey
    FOREIGN KEY (artist_id) REFERENCES artist (artist_id) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE INDEX album_artist_id_idx ON album (artist_id);

ALTER TABLE customer ADD CONSTRAINT customer_support_rep_id_fkey
    FOREIGN KEY (support_rep_id) REFERENCES employee (employee_id) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE INDEX customer_support_rep_id_idx ON customer (support_rep_id);

ALTER TABLE employee ADD CONSTRAINT employee_reports_to_fkey
    FOREIGN KEY (reports_to) REFERENCES employee (employee_id) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE INDEX employee_reports_to_idx ON employee (reports_to);

ALTER TABLE invoice ADD CONSTRAINT invoice_customer_id_fkey
    FOREIGN KEY (customer_id) REFERENCES customer (customer_id) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE INDEX invoice_customer_id_idx ON invoice (customer_id);

ALTER TABLE invoice_line ADD CONSTRAINT invoice_line_invoice_id_fkey
    FOREIGN KEY (invoice_id) REFERENCES invoice (invoice_id) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE INDEX invoice_line_invoice_id_idx ON invoice_line (invoice_id);

ALTER TABLE invoice_line ADD CONSTRAINT invoice_line_track_id_fkey
    FOREIGN KEY (track_id) REFERENCES track (track_id) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE INDEX invoice_line_track_id_idx ON invoice_line (track_id);

ALTER TABLE playlist_track ADD CONSTRAINT playlist_track_playlist_id_fkey
    FOREIGN KEY (playlist_id) REFERENCES playlist (playlist_id) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE INDEX playlist_track_playlist_id_idx ON playlist_track (playlist_id);

ALTER TABLE playlist_track ADD CONSTRAINT playlist_track_track_id_fkey
    FOREIGN KEY (track_id) REFERENCES track (track_id) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE INDEX playlist_track_track_id_idx ON playlist_track (track_id);

ALTER TABLE track ADD CONSTRAINT track_album_id_fkey
    FOREIGN KEY (album_id) REFERENCES album (album_id) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE INDEX track_album_id_idx ON track (album_id);

ALTER TABLE track ADD CONSTRAINT track_genre_id_fkey
    FOREIGN KEY (genre_id) REFERENCES genre (genre_id) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE INDEX track_genre_id_idx ON track (genre_id);

ALTER TABLE track ADD CONSTRAINT track_media_type_id_fkey
    FOREIGN KEY (media_type_id) REFERENCES media_type (media_type_id) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE INDEX track_media_type_id_idx ON track (media_type_id);

-- ============================================================================
-- STORED PROCEDURES (FUNCTIONS in PostgreSQL)
-- ============================================================================

-- 1. Invoice Report 
-- This deliberately uses inefficient patterns to simulate poor performance

CREATE OR REPLACE FUNCTION sp_InvoiceReport(p_InvoiceId INTEGER)
RETURNS TABLE (
    TrackId INTEGER,
    TrackName VARCHAR(200),
    Composer VARCHAR(220),
    GenreId INTEGER,
    Milliseconds INTEGER,
    UnitPrice NUMERIC(10,2),
    Quantity INTEGER,
    AlbumTrackCount BIGINT,
    GenreName VARCHAR(120)
) AS $$
BEGIN
    -- Add artificial delay for demonstration
    PERFORM pg_sleep(2);
    
    -- Simplified query to avoid PostgreSQL-specific issues
    RETURN QUERY
    SELECT DISTINCT
        t.track_id::INTEGER,
        t.name::VARCHAR(200) AS TrackName,
        t.composer::VARCHAR(220),
        t.genre_id::INTEGER,
        t.milliseconds::INTEGER,
        il.unit_price::NUMERIC(10,2),
        il.quantity::INTEGER,
        -- Simplified subqueries
        (SELECT COUNT(*)::BIGINT FROM track t2 WHERE t2.album_id = t.album_id) AS AlbumTrackCount,
        (SELECT g.name::VARCHAR(120) FROM genre g WHERE g.genre_id = t.genre_id) AS GenreName
    FROM track t
    JOIN invoice_line il ON il.track_id = t.track_id 
    WHERE il.invoice_id = p_InvoiceId;
END;
$$ LANGUAGE plpgsql;

-- 2. Customer Summary

CREATE OR REPLACE FUNCTION sp_CustomerSummary(p_CustomerId INTEGER)
RETURNS TABLE (
    CustomerId INTEGER,
    FullName VARCHAR(120),
    Email VARCHAR(60),
    Country VARCHAR(40),
    TotalInvoices BIGINT,
    TotalSpent NUMERIC(10,2),
    AverageOrderValue NUMERIC(10,2),
    LastPurchaseDate TIMESTAMP,
    TotalItemsPurchased BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.customer_id::INTEGER,
        (c.first_name || ' ' || c.last_name)::VARCHAR(120) AS FullName,
        c.email::VARCHAR(60),
        c.country::VARCHAR(40),
        COUNT(i.invoice_id)::BIGINT AS TotalInvoices,
        COALESCE(SUM(i.total), 0)::NUMERIC(10,2) AS TotalSpent,
        COALESCE(AVG(i.total), 0)::NUMERIC(10,2) AS AverageOrderValue,
        MAX(i.invoice_date)::TIMESTAMP AS LastPurchaseDate,
        (SELECT COUNT(*)::BIGINT FROM invoice_line il 
         JOIN invoice i2 ON il.invoice_id = i2.invoice_id 
         WHERE i2.customer_id = c.customer_id) AS TotalItemsPurchased
    FROM customer c
    LEFT JOIN invoice i ON c.customer_id = i.customer_id
    WHERE c.customer_id = p_CustomerId
    GROUP BY c.customer_id, c.first_name, c.last_name, c.email, c.country;
END;
$$ LANGUAGE plpgsql;

-- 3. Top Tracks

CREATE OR REPLACE FUNCTION sp_TopTracks(p_TopCount INTEGER DEFAULT 10)
RETURNS TABLE (
    TrackId INTEGER,
    TrackName VARCHAR(200),
    AlbumTitle VARCHAR(160),
    ArtistName VARCHAR(120),
    GenreName VARCHAR(120),
    TimesPurchased BIGINT,
    TotalQuantitySold BIGINT,
    TotalRevenue NUMERIC(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.track_id::INTEGER,
        t.name::VARCHAR(200) AS TrackName,
        a.title::VARCHAR(160) AS AlbumTitle,
        ar.name::VARCHAR(120) AS ArtistName,
        g.name::VARCHAR(120) AS GenreName,
        COUNT(il.invoice_line_id)::BIGINT AS TimesPurchased,
        COALESCE(SUM(il.quantity), 0)::BIGINT AS TotalQuantitySold,
        COALESCE(SUM(il.unit_price * il.quantity), 0)::NUMERIC(10,2) AS TotalRevenue
    FROM track t
    JOIN album a ON t.album_id = a.album_id
    JOIN artist ar ON a.artist_id = ar.artist_id
    JOIN genre g ON t.genre_id = g.genre_id
    LEFT JOIN invoice_line il ON t.track_id = il.track_id
    GROUP BY t.track_id, t.name, a.title, ar.name, g.name
    ORDER BY TimesPurchased DESC, TotalRevenue DESC
    LIMIT p_TopCount;
END;
$$ LANGUAGE plpgsql;

-- 4. Sales Report

CREATE OR REPLACE FUNCTION sp_SalesReport(p_StartDate DATE DEFAULT NULL, p_EndDate DATE DEFAULT NULL)
RETURNS TABLE (
    SaleDate DATE,
    InvoiceCount BIGINT,
    DailyRevenue NUMERIC(10,2),
    AverageInvoiceValue NUMERIC(10,2),
    UniqueCustomers BIGINT,
    ItemsSold BIGINT
) AS $$
BEGIN
    -- Default to last 30 days if no dates provided
    p_StartDate := COALESCE(p_StartDate, CURRENT_DATE - INTERVAL '30 days');
    p_EndDate := COALESCE(p_EndDate, CURRENT_DATE);
    
    RETURN QUERY
    SELECT 
        i.invoice_date::DATE AS SaleDate,
        COUNT(i.invoice_id)::BIGINT AS InvoiceCount,
        SUM(i.total)::NUMERIC(10,2) AS DailyRevenue,
        AVG(i.total)::NUMERIC(10,2) AS AverageInvoiceValue,
        COUNT(DISTINCT i.customer_id)::BIGINT AS UniqueCustomers,
        SUM(il.quantity)::BIGINT AS ItemsSold
    FROM invoice i
    JOIN invoice_line il ON i.invoice_id = il.invoice_id
    WHERE i.invoice_date::DATE BETWEEN p_StartDate AND p_EndDate
    GROUP BY i.invoice_date::DATE
    ORDER BY SaleDate DESC;
END;
$$ LANGUAGE plpgsql;

-- 5. Employee Stats

CREATE OR REPLACE FUNCTION sp_EmployeeStats(p_EmployeeId INTEGER DEFAULT NULL)
RETURNS TABLE (
    EmployeeId INTEGER,
    FullName VARCHAR(80),
    Title VARCHAR(30),
    CustomersSupported BIGINT,
    TotalInvoices BIGINT,
    TotalSalesGenerated NUMERIC(10,2),
    AverageInvoiceValue NUMERIC(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.employee_id::INTEGER,
        (e.first_name || ' ' || e.last_name)::VARCHAR(80) AS FullName,
        e.title::VARCHAR(30),
        COUNT(DISTINCT c.customer_id)::BIGINT AS CustomersSupported,
        COUNT(i.invoice_id)::BIGINT AS TotalInvoices,
        COALESCE(SUM(i.total), 0)::NUMERIC(10,2) AS TotalSalesGenerated,
        COALESCE(AVG(i.total), 0)::NUMERIC(10,2) AS AverageInvoiceValue
    FROM employee e
    LEFT JOIN customer c ON e.employee_id = c.support_rep_id
    LEFT JOIN invoice i ON c.customer_id = i.customer_id
    WHERE (p_EmployeeId IS NULL OR e.employee_id = p_EmployeeId)
    GROUP BY e.employee_id, e.first_name, e.last_name, e.title
    ORDER BY TotalSalesGenerated DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS
-- ============================================================================

-- 1. Customer Invoice Summary View

CREATE VIEW vw_CustomerInvoiceSummary AS
SELECT 
    c.customer_id,
    (c.first_name || ' ' || c.last_name) AS customer_name,
    c.email,
    c.country,
    c.city,
    COUNT(i.invoice_id) AS total_invoices,
    COALESCE(SUM(i.total), 0) AS total_spent,
    COALESCE(AVG(i.total), 0) AS average_order_value,
    MIN(i.invoice_date) AS first_purchase,
    MAX(i.invoice_date) AS last_purchase,
    (MAX(i.invoice_date) - MIN(i.invoice_date)) AS customer_lifespan_days
FROM customer c
LEFT JOIN invoice i ON c.customer_id = i.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name, c.email, c.country, c.city;

-- 2. Track Popularity View

CREATE VIEW vw_TrackPopularity AS
SELECT 
    t.track_id,
    t.name AS track_name,
    a.title AS album_title,
    ar.name AS artist_name,
    g.name AS genre_name,
    t.milliseconds,
    COUNT(il.invoice_line_id) AS times_purchased,
    COALESCE(SUM(il.quantity), 0) AS total_quantity_sold,
    COALESCE(SUM(il.unit_price * il.quantity), 0) AS total_revenue,
    COALESCE(AVG(il.unit_price), 0) AS average_price
FROM track t
JOIN album a ON t.album_id = a.album_id
JOIN artist ar ON a.artist_id = ar.artist_id
JOIN genre g ON t.genre_id = g.genre_id
LEFT JOIN invoice_line il ON t.track_id = il.track_id
GROUP BY t.track_id, t.name, a.title, ar.name, g.name, t.milliseconds;

-- 3. Monthly Revenue View

CREATE VIEW vw_MonthlyRevenue AS
SELECT 
    EXTRACT(YEAR FROM i.invoice_date) AS revenue_year,
    EXTRACT(MONTH FROM i.invoice_date) AS revenue_month,
    TO_CHAR(i.invoice_date, 'Month') AS month_name,
    COUNT(i.invoice_id) AS invoice_count,
    SUM(i.total) AS monthly_revenue,
    AVG(i.total) AS average_invoice_value,
    COUNT(DISTINCT i.customer_id) AS unique_customers,
    SUM(il.quantity) AS items_sold
FROM invoice i
JOIN invoice_line il ON i.invoice_id = il.invoice_id
GROUP BY EXTRACT(YEAR FROM i.invoice_date), EXTRACT(MONTH FROM i.invoice_date), TO_CHAR(i.invoice_date, 'Month');

-- 4. Employee Performance View

CREATE VIEW vw_EmployeePerformance AS
SELECT 
    e.employee_id,
    (e.first_name || ' ' || e.last_name) AS employee_name,
    e.title,
    COUNT(DISTINCT c.customer_id) AS customers_supported,
    COUNT(i.invoice_id) AS total_invoices,
    COALESCE(SUM(i.total), 0) AS total_sales_generated,
    COALESCE(AVG(i.total), 0) AS average_invoice_value,
    CASE 
        WHEN COUNT(i.invoice_id) > 50 THEN 'High Performer'
        WHEN COUNT(i.invoice_id) > 20 THEN 'Good Performer'
        ELSE 'Developing'
    END AS performance_category
FROM employee e
LEFT JOIN customer c ON e.employee_id = c.support_rep_id
LEFT JOIN invoice i ON c.customer_id = i.customer_id
GROUP BY e.employee_id, e.first_name, e.last_name, e.title;

-- 5. Genre Statistics View

CREATE VIEW vw_GenreStatistics AS
SELECT 
    g.genre_id,
    g.name AS genre_name,
    COUNT(DISTINCT t.track_id) AS total_tracks,
    COUNT(DISTINCT a.album_id) AS total_albums,
    COUNT(DISTINCT ar.artist_id) AS total_artists,
    COUNT(il.invoice_line_id) AS times_purchased,
    COALESCE(SUM(il.quantity), 0) AS total_quantity_sold,
    COALESCE(SUM(il.unit_price * il.quantity), 0) AS total_revenue,
    COALESCE(AVG(il.unit_price), 0) AS average_track_price
FROM genre g
LEFT JOIN track t ON g.genre_id = t.genre_id
LEFT JOIN album a ON t.album_id = a.album_id
LEFT JOIN artist ar ON a.artist_id = ar.artist_id
LEFT JOIN invoice_line il ON t.track_id = il.track_id
GROUP BY g.genre_id, g.name;