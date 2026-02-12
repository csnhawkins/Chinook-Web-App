-- /*******************************************************************************
--   Chinook Database 
--   Description: Creates and populates the Chinook database.
--   DB Server: Oracle
--   Original Author: Luis Rocha (Evolved by Chris Hawkins at Redgate Software Ltd)
--   License: https://github.com/lerocha/chinook-database/blob/master/LICENSE.md
-----------------------------------------------------------------------------------
--   Version: 1.0.0
--   Last Updated: 2026-02-05
--   Update Notes: Added named constraints for all tables
-- ********************************************************************************/

/*******************************************************************************
   Drop database if it exists
********************************************************************************/
-- DROP USER chinook CASCADE;


-- /*******************************************************************************
--    Create database
-- ********************************************************************************/
-- CREATE USER chinook
-- IDENTIFIED BY chinook
-- DEFAULT TABLESPACE users
-- TEMPORARY TABLESPACE temp
-- QUOTA 10M ON users;

-- GRANT connect to chinook;
-- GRANT resource to chinook;
-- GRANT create session TO chinook;
-- GRANT create table TO chinook;
-- GRANT create view TO chinook;

/*******************************************************************************
   Create Tables
********************************************************************************/
CREATE TABLE Album
(
    AlbumId NUMBER NOT NULL,
    Title VARCHAR2(160) NOT NULL,
    ArtistId NUMBER NOT NULL,
    CONSTRAINT PK_Album PRIMARY KEY  (AlbumId)
);

CREATE TABLE Artist
(
    ArtistId NUMBER NOT NULL,
    Name VARCHAR2(120),
    CONSTRAINT PK_Artist PRIMARY KEY  (ArtistId)
);

CREATE TABLE Customer
(
    CustomerId NUMBER NOT NULL,
    FirstName VARCHAR2(40) NOT NULL,
    LastName VARCHAR2(20) NOT NULL,
    Company VARCHAR2(80),
    Address VARCHAR2(70),
    City VARCHAR2(40),
    State VARCHAR2(40),
    Country VARCHAR2(40),
    PostalCode VARCHAR2(10),
    Phone VARCHAR2(24),
    Fax VARCHAR2(24),
    Email VARCHAR2(60) NOT NULL,
    SupportRepId NUMBER,
    CONSTRAINT PK_Customer PRIMARY KEY  (CustomerId)
);

CREATE TABLE Employee
(
    EmployeeId NUMBER NOT NULL,
    LastName VARCHAR2(20) NOT NULL,
    FirstName VARCHAR2(20) NOT NULL,
    Title VARCHAR2(30),
    ReportsTo NUMBER,
    BirthDate DATE,
    HireDate DATE,
    Address VARCHAR2(70),
    City VARCHAR2(40),
    State VARCHAR2(40),
    Country VARCHAR2(40),
    PostalCode VARCHAR2(10),
    Phone VARCHAR2(24),
    Fax VARCHAR2(24),
    Email VARCHAR2(60),
    CONSTRAINT PK_Employee PRIMARY KEY  (EmployeeId)
);

CREATE TABLE Genre
(
    GenreId NUMBER NOT NULL,
    Name VARCHAR2(120),
    CONSTRAINT PK_Genre PRIMARY KEY  (GenreId)
);

CREATE TABLE Invoice
(
    InvoiceId NUMBER NOT NULL,
    CustomerId NUMBER NOT NULL,
    InvoiceDate DATE NOT NULL,
    BillingAddress VARCHAR2(70),
    BillingCity VARCHAR2(40),
    BillingState VARCHAR2(40),
    BillingCountry VARCHAR2(40),
    BillingPostalCode VARCHAR2(10),
    Total NUMBER(10,2) NOT NULL,
    CONSTRAINT PK_Invoice PRIMARY KEY  (InvoiceId)
);

CREATE TABLE InvoiceLine
(
    InvoiceLineId NUMBER NOT NULL,
    InvoiceId NUMBER NOT NULL,
    TrackId NUMBER NOT NULL,
    UnitPrice NUMBER(10,2) NOT NULL,
    Quantity NUMBER NOT NULL,
    CONSTRAINT PK_InvoiceLine PRIMARY KEY  (InvoiceLineId)
);

CREATE TABLE MediaType
(
    MediaTypeId NUMBER NOT NULL,
    Name VARCHAR2(120),
    CONSTRAINT PK_MediaType PRIMARY KEY  (MediaTypeId)
);

CREATE TABLE Playlist
(
    PlaylistId NUMBER NOT NULL,
    Name VARCHAR2(120),
    CONSTRAINT PK_Playlist PRIMARY KEY  (PlaylistId)
);

CREATE TABLE PlaylistTrack
(
    PlaylistId NUMBER NOT NULL,
    TrackId NUMBER NOT NULL,
    CONSTRAINT PK_PlaylistTrack PRIMARY KEY  (PlaylistId, TrackId)
);

CREATE TABLE Track
(
    TrackId NUMBER NOT NULL,
    Name VARCHAR2(200) NOT NULL,
    AlbumId NUMBER,
    MediaTypeId NUMBER NOT NULL,
    GenreId NUMBER,
    Composer VARCHAR2(220),
    Milliseconds NUMBER NOT NULL,
    Bytes NUMBER,
    UnitPrice NUMBER(10,2) NOT NULL,
    CONSTRAINT PK_Track PRIMARY KEY  (TrackId)
);

CREATE TABLE TrackReview (
    ReviewId NUMBER NOT NULL,
    TrackId NUMBER NOT NULL,
    ReviewerName VARCHAR2(100) NOT NULL,
    Rating NUMBER,
    ReviewText VARCHAR2(1000),
    ReviewDate DATE NOT NULL,
    CONSTRAINT CK_TrackReview_Rating CHECK (Rating BETWEEN 1 AND 5)
);

CREATE SEQUENCE TrackReview_Seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER TrackReview_BI
BEFORE INSERT ON TrackReview
FOR EACH ROW
BEGIN
  IF :NEW.ReviewId IS NULL THEN
    SELECT TrackReview_Seq.NEXTVAL INTO :NEW.ReviewId FROM dual;
  END IF;
END;
/

-- AppConfig
CREATE TABLE AppConfig (
    ConfigId NUMBER NOT NULL,
    ConfigKey VARCHAR2(50) NOT NULL,
    ConfigValue VARCHAR2(200) NOT NULL,
    CONSTRAINT PK_AppConfig PRIMARY KEY (ConfigId)
);

CREATE SEQUENCE AppConfig_Seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER AppConfig_BI
BEFORE INSERT ON AppConfig
FOR EACH ROW
BEGIN
  IF :NEW.ConfigId IS NULL THEN
    SELECT AppConfig_Seq.NEXTVAL INTO :NEW.ConfigId FROM dual;
  END IF;
END;
/

CREATE TABLE SystemLog (
    LogId NUMBER NOT NULL,
    InvoiceId NUMBER NOT NULL, -- logically references Invoice
    LogDate DATE NOT NULL,
    LogMessage CLOB,
    CONSTRAINT PK_SystemLog PRIMARY KEY (LogId)
);

CREATE SEQUENCE SystemLog_Seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER SystemLog_BI
BEFORE INSERT ON SystemLog
FOR EACH ROW
BEGIN
  IF :NEW.LogId IS NULL THEN
    SELECT SystemLog_Seq.NEXTVAL INTO :NEW.LogId FROM dual;
  END IF;
END;
/

/*******************************************************************************
   Create Primary Key Unique Indexes
********************************************************************************/

/*******************************************************************************
   Create Foreign Keys
********************************************************************************/
ALTER TABLE Album ADD CONSTRAINT FK_AlbumArtistId
    FOREIGN KEY (ArtistId) REFERENCES Artist (ArtistId)  ;

ALTER TABLE Customer ADD CONSTRAINT FK_CustomerSupportRepId
    FOREIGN KEY (SupportRepId) REFERENCES Employee (EmployeeId)  ;

ALTER TABLE Employee ADD CONSTRAINT FK_EmployeeReportsTo
    FOREIGN KEY (ReportsTo) REFERENCES Employee (EmployeeId)  ;

ALTER TABLE Invoice ADD CONSTRAINT FK_InvoiceCustomerId
    FOREIGN KEY (CustomerId) REFERENCES Customer (CustomerId)  ;

ALTER TABLE InvoiceLine ADD CONSTRAINT FK_InvoiceLineInvoiceId
    FOREIGN KEY (InvoiceId) REFERENCES Invoice (InvoiceId)  ;

ALTER TABLE InvoiceLine ADD CONSTRAINT FK_InvoiceLineTrackId
    FOREIGN KEY (TrackId) REFERENCES Track (TrackId)  ;

ALTER TABLE PlaylistTrack ADD CONSTRAINT FK_PlaylistTrackPlaylistId
    FOREIGN KEY (PlaylistId) REFERENCES Playlist (PlaylistId)  ;

ALTER TABLE PlaylistTrack ADD CONSTRAINT FK_PlaylistTrackTrackId
    FOREIGN KEY (TrackId) REFERENCES Track (TrackId)  ;

ALTER TABLE Track ADD CONSTRAINT FK_TrackAlbumId
    FOREIGN KEY (AlbumId) REFERENCES Album (AlbumId)  ;

ALTER TABLE Track ADD CONSTRAINT FK_TrackGenreId
    FOREIGN KEY (GenreId) REFERENCES Genre (GenreId)  ;

ALTER TABLE Track ADD CONSTRAINT FK_TrackMediaTypeId
    FOREIGN KEY (MediaTypeId) REFERENCES MediaType (MediaTypeId)  ;

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- 1. Invoice Report

CREATE OR REPLACE PROCEDURE SP_INVOICEREPORT(
    P_INVOICEID IN NUMBER,
    P_CURSOR OUT SYS_REFCURSOR
) 
AS
    V_COUNT NUMBER;
BEGIN
    -- Add artificial delay for demonstration using a wasteful calculation
    SELECT SUM(TRACKID) INTO V_COUNT FROM TRACK WHERE ROWNUM <= 1000;
    
    -- Simple query to test basic functionality first
    OPEN P_CURSOR FOR
    SELECT 
        T.TRACKID,
        T.NAME AS TRACKNAME,
        T.COMPOSER,
        T.GENREID,
        T.MILLISECONDS,
        IL.UNITPRICE,
        IL.QUANTITY,
        (SELECT COUNT(*) FROM TRACK T2 WHERE T2.ALBUMID = T.ALBUMID) AS ALBUMTRACKCOUNT,
        (SELECT G.NAME FROM GENRE G WHERE G.GENREID = T.GENREID) AS GENRENAME
    FROM TRACK T
    JOIN INVOICELINE IL ON IL.TRACKID = T.TRACKID 
    WHERE IL.INVOICEID = P_INVOICEID;
EXCEPTION
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20001, 'Error in SP_INVOICEREPORT: ' || SQLERRM);
END SP_INVOICEREPORT;
/

-- 2. Customer Summary
CREATE OR REPLACE PROCEDURE sp_CustomerSummary(
    p_CustomerId IN NUMBER,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
    SELECT 
        c.CustomerId,
        (c.FirstName || ' ' || c.LastName) AS FullName,
        c.Email,
        c.Country,
        COUNT(i.InvoiceId) AS TotalInvoices,
        NVL(SUM(i.Total), 0) AS TotalSpent,
        NVL(AVG(i.Total), 0) AS AverageOrderValue,
        MAX(i.InvoiceDate) AS LastPurchaseDate,
        (SELECT COUNT(*) FROM InvoiceLine il 
         JOIN Invoice i2 ON il.InvoiceId = i2.InvoiceId 
         WHERE i2.CustomerId = c.CustomerId) AS TotalItemsPurchased
    FROM Customer c
    LEFT JOIN Invoice i ON c.CustomerId = i.CustomerId
    WHERE c.CustomerId = p_CustomerId
    GROUP BY c.CustomerId, c.FirstName, c.LastName, c.Email, c.Country;
END sp_CustomerSummary;
/

-- 3. Top Tracks
CREATE OR REPLACE PROCEDURE sp_TopTracks(
    p_TopCount IN NUMBER DEFAULT 10,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
    SELECT * FROM (
        SELECT 
            t.TrackId,
            t.Name AS TrackName,
            a.Title AS AlbumTitle,
            ar.Name AS ArtistName,
            g.Name AS GenreName,
            COUNT(il.InvoiceLineId) AS TimesPurchased,
            NVL(SUM(il.Quantity), 0) AS TotalQuantitySold,
            NVL(SUM(il.UnitPrice * il.Quantity), 0) AS TotalRevenue
        FROM Track t
        JOIN Album a ON t.AlbumId = a.AlbumId
        JOIN Artist ar ON a.ArtistId = ar.ArtistId
        JOIN Genre g ON t.GenreId = g.GenreId
        LEFT JOIN InvoiceLine il ON t.TrackId = il.TrackId
        GROUP BY t.TrackId, t.Name, a.Title, ar.Name, g.Name
        ORDER BY COUNT(il.InvoiceLineId) DESC, NVL(SUM(il.UnitPrice * il.Quantity), 0) DESC
    )
    WHERE ROWNUM <= NVL(p_TopCount, 10);
END sp_TopTracks;
/

-- 4. Sales Report
CREATE OR REPLACE PROCEDURE sp_SalesReport(
    p_StartDate IN DATE DEFAULT NULL,
    p_EndDate IN DATE DEFAULT NULL,
    p_cursor OUT SYS_REFCURSOR
) AS
    v_StartDate DATE;
    v_EndDate DATE;
BEGIN
    -- Default to last 30 days if no dates provided
    v_StartDate := NVL(p_StartDate, SYSDATE - 30);
    v_EndDate := NVL(p_EndDate, SYSDATE);
    
    OPEN p_cursor FOR
    SELECT 
        TRUNC(i.InvoiceDate) AS SaleDate,
        COUNT(i.InvoiceId) AS InvoiceCount,
        SUM(i.Total) AS DailyRevenue,
        AVG(i.Total) AS AverageInvoiceValue,
        COUNT(DISTINCT i.CustomerId) AS UniqueCustomers,
        SUM(il.Quantity) AS ItemsSold
    FROM Invoice i
    JOIN InvoiceLine il ON i.InvoiceId = il.InvoiceId
    WHERE TRUNC(i.InvoiceDate) BETWEEN v_StartDate AND v_EndDate
    GROUP BY TRUNC(i.InvoiceDate)
    ORDER BY SaleDate DESC;
END sp_SalesReport;
/

-- 5. Employee Stats
CREATE OR REPLACE PROCEDURE sp_EmployeeStats(
    p_EmployeeId IN NUMBER DEFAULT NULL,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
    SELECT 
        e.EmployeeId,
        (e.FirstName || ' ' || e.LastName) AS FullName,
        e.Title,
        COUNT(DISTINCT c.CustomerId) AS CustomersSupported,
        COUNT(i.InvoiceId) AS TotalInvoices,
        NVL(SUM(i.Total), 0) AS TotalSalesGenerated,
        NVL(AVG(i.Total), 0) AS AverageInvoiceValue
    FROM Employee e
    LEFT JOIN Customer c ON e.EmployeeId = c.SupportRepId
    LEFT JOIN Invoice i ON c.CustomerId = i.CustomerId
    WHERE (p_EmployeeId IS NULL OR e.EmployeeId = p_EmployeeId)
    GROUP BY e.EmployeeId, e.FirstName, e.LastName, e.Title
    ORDER BY NVL(SUM(i.Total), 0) DESC;
END sp_EmployeeStats;
/

-- ============================================================================
-- VIEWS
-- ============================================================================

-- 1. Customer Invoice Summary View
CREATE OR REPLACE VIEW vw_CustomerInvoiceSummary AS
SELECT 
    c.CustomerId,
    (c.FirstName || ' ' || c.LastName) AS CustomerName,
    c.Email,
    c.Country,
    c.City,
    COUNT(i.InvoiceId) AS TotalInvoices,
    NVL(SUM(i.Total), 0) AS TotalSpent,
    NVL(AVG(i.Total), 0) AS AverageOrderValue,
    MIN(i.InvoiceDate) AS FirstPurchase,
    MAX(i.InvoiceDate) AS LastPurchase,
    (MAX(i.InvoiceDate) - MIN(i.InvoiceDate)) AS CustomerLifespanDays
FROM Customer c
LEFT JOIN Invoice i ON c.CustomerId = i.CustomerId
GROUP BY c.CustomerId, c.FirstName, c.LastName, c.Email, c.Country, c.City;

-- 2. Track Popularity View
CREATE OR REPLACE VIEW vw_TrackPopularity AS
SELECT 
    t.TrackId,
    t.Name AS TrackName,
    a.Title AS AlbumTitle,
    ar.Name AS ArtistName,
    g.Name AS GenreName,
    t.Milliseconds,
    COUNT(il.InvoiceLineId) AS TimesPurchased,
    SUM(il.Quantity) AS TotalQuantitySold,
    SUM(il.UnitPrice * il.Quantity) AS TotalRevenue,
    AVG(il.UnitPrice) AS AveragePrice
FROM Track t
JOIN Album a ON t.AlbumId = a.AlbumId
JOIN Artist ar ON a.ArtistId = ar.ArtistId
JOIN Genre g ON t.GenreId = g.GenreId
LEFT JOIN InvoiceLine il ON t.TrackId = il.TrackId
GROUP BY t.TrackId, t.Name, a.Title, ar.Name, g.Name, t.Milliseconds;

-- 3. Monthly Revenue View
CREATE OR REPLACE VIEW vw_MonthlyRevenue AS
SELECT 
    EXTRACT(YEAR FROM i.InvoiceDate) AS RevenueYear,
    EXTRACT(MONTH FROM i.InvoiceDate) AS RevenueMonth,
    TO_CHAR(i.InvoiceDate, 'Month') AS MonthName,
    COUNT(i.InvoiceId) AS InvoiceCount,
    SUM(i.Total) AS MonthlyRevenue,
    AVG(i.Total) AS AverageInvoiceValue,
    COUNT(DISTINCT i.CustomerId) AS UniqueCustomers,
    SUM(il.Quantity) AS ItemsSold
FROM Invoice i
JOIN InvoiceLine il ON i.InvoiceId = il.InvoiceId
GROUP BY EXTRACT(YEAR FROM i.InvoiceDate), EXTRACT(MONTH FROM i.InvoiceDate), TO_CHAR(i.InvoiceDate, 'Month');

-- 4. Employee Performance View
CREATE OR REPLACE VIEW vw_EmployeePerformance AS
SELECT 
    e.EmployeeId,
    (e.FirstName || ' ' || e.LastName) AS EmployeeName,
    e.Title,
    COUNT(DISTINCT c.CustomerId) AS CustomersSupported,
    COUNT(i.InvoiceId) AS TotalInvoices,
    NVL(SUM(i.Total), 0) AS TotalSalesGenerated,
    NVL(AVG(i.Total), 0) AS AverageInvoiceValue,
    CASE 
        WHEN COUNT(i.InvoiceId) > 50 THEN 'High Performer'
        WHEN COUNT(i.InvoiceId) > 20 THEN 'Good Performer'
        ELSE 'Developing'
    END AS PerformanceCategory
FROM Employee e
LEFT JOIN Customer c ON e.EmployeeId = c.SupportRepId
LEFT JOIN Invoice i ON c.CustomerId = i.CustomerId
GROUP BY e.EmployeeId, e.FirstName, e.LastName, e.Title;

-- 5. Genre Statistics View
CREATE OR REPLACE VIEW vw_GenreStatistics AS
SELECT 
    g.GenreId,
    g.Name AS GenreName,
    COUNT(DISTINCT t.TrackId) AS TotalTracks,
    COUNT(DISTINCT a.AlbumId) AS TotalAlbums,
    COUNT(DISTINCT ar.ArtistId) AS TotalArtists,
    COUNT(il.InvoiceLineId) AS TimesPurchased,
    SUM(il.Quantity) AS TotalQuantitySold,
    SUM(il.UnitPrice * il.Quantity) AS TotalRevenue,
    AVG(il.UnitPrice) AS AverageTrackPrice
FROM Genre g
LEFT JOIN Track t ON g.GenreId = t.GenreId
LEFT JOIN Album a ON t.AlbumId = a.AlbumId
LEFT JOIN Artist ar ON a.ArtistId = ar.ArtistId
LEFT JOIN InvoiceLine il ON t.TrackId = il.TrackId
GROUP BY g.GenreId, g.Name;