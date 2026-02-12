-- /*******************************************************************************
--   Chinook Database 
--   Description: Creates and populates the Chinook database.
--   DB Server: SQL Server
--   Original Author: Luis Rocha (Evolved by Chris Hawkins at Redgate Software Ltd)
--   License: https://github.com/lerocha/chinook-database/blob/master/LICENSE.md
-----------------------------------------------------------------------------------
--   Version: 1.0.0
--   Last Updated: 2026-02-05
--   Update Notes: Added named constraints for all tables
-- ********************************************************************************/

/*******************************************************************************
   Create Tables
********************************************************************************/
CREATE TABLE [dbo].[Album]
(
    [AlbumId] INT NOT NULL IDENTITY,
    [Title] NVARCHAR(160) NOT NULL,
    [ArtistId] INT NOT NULL,
    CONSTRAINT [PK_Album] PRIMARY KEY CLUSTERED ([AlbumId])
);
GO
CREATE TABLE [dbo].[Artist]
(
    [ArtistId] INT NOT NULL IDENTITY,
    [Name] NVARCHAR(120),
    CONSTRAINT [PK_Artist] PRIMARY KEY CLUSTERED ([ArtistId])
);
GO
CREATE TABLE [dbo].[Customer]
(
    [CustomerId] INT NOT NULL IDENTITY,
    [FirstName] NVARCHAR(40) NOT NULL,
    [LastName] NVARCHAR(20) NOT NULL,
    [Company] NVARCHAR(80),
    [Address] NVARCHAR(70),
    [City] NVARCHAR(40),
    [State] NVARCHAR(40),
    [Country] NVARCHAR(40),
    [PostalCode] NVARCHAR(10),
    [Phone] NVARCHAR(24),
    [Fax] NVARCHAR(24),
    [Email] NVARCHAR(60) NOT NULL,
    [SupportRepId] INT,
    CONSTRAINT [PK_Customer] PRIMARY KEY CLUSTERED ([CustomerId])
);
GO
CREATE TABLE [dbo].[Employee]
(
    [EmployeeId] INT NOT NULL IDENTITY,
    [LastName] NVARCHAR(20) NOT NULL,
    [FirstName] NVARCHAR(20) NOT NULL,
    [Title] NVARCHAR(30),
    [ReportsTo] INT,
    [BirthDate] DATETIME,
    [HireDate] DATETIME,
    [Address] NVARCHAR(70),
    [City] NVARCHAR(40),
    [State] NVARCHAR(40),
    [Country] NVARCHAR(40),
    [PostalCode] NVARCHAR(10),
    [Phone] NVARCHAR(24),
    [Fax] NVARCHAR(24),
    [Email] NVARCHAR(60),
    CONSTRAINT [PK_Employee] PRIMARY KEY CLUSTERED ([EmployeeId])
);
GO
CREATE TABLE [dbo].[Genre]
(
    [GenreId] INT NOT NULL IDENTITY,
    [Name] NVARCHAR(120),
    CONSTRAINT [PK_Genre] PRIMARY KEY CLUSTERED ([GenreId])
);
GO
CREATE TABLE [dbo].[Invoice]
(
    [InvoiceId] INT NOT NULL IDENTITY,
    [CustomerId] INT NOT NULL,
    [InvoiceDate] DATETIME NOT NULL,
    [BillingAddress] NVARCHAR(70),
    [BillingCity] NVARCHAR(40),
    [BillingState] NVARCHAR(40),
    [BillingCountry] NVARCHAR(40),
    [BillingPostalCode] NVARCHAR(10),
    [Total] NUMERIC(10,2) NOT NULL,
    CONSTRAINT [PK_Invoice] PRIMARY KEY CLUSTERED ([InvoiceId])
);
GO
CREATE TABLE [dbo].[InvoiceLine]
(
    [InvoiceLineId] INT NOT NULL IDENTITY,
    [InvoiceId] INT NOT NULL,
    [TrackId] INT NOT NULL,
    [UnitPrice] NUMERIC(10,2) NOT NULL,
    [Quantity] INT NOT NULL,
    CONSTRAINT [PK_InvoiceLine] PRIMARY KEY CLUSTERED ([InvoiceLineId])
);
GO
CREATE TABLE [dbo].[MediaType]
(
    [MediaTypeId] INT NOT NULL IDENTITY,
    [Name] NVARCHAR(120),
    CONSTRAINT [PK_MediaType] PRIMARY KEY CLUSTERED ([MediaTypeId])
);
GO
CREATE TABLE [dbo].[Playlist]
(
    [PlaylistId] INT NOT NULL IDENTITY,
    [Name] NVARCHAR(120),
    CONSTRAINT [PK_Playlist] PRIMARY KEY CLUSTERED ([PlaylistId])
);
GO
CREATE TABLE [dbo].[PlaylistTrack]
(
    [PlaylistId] INT NOT NULL,
    [TrackId] INT NOT NULL,
    CONSTRAINT [PK_PlaylistTrack] PRIMARY KEY NONCLUSTERED ([PlaylistId], [TrackId])
);
GO
CREATE TABLE [dbo].[Track]
(
    [TrackId] INT NOT NULL IDENTITY,
    [Name] NVARCHAR(200) NOT NULL,
    [AlbumId] INT,
    [MediaTypeId] INT NOT NULL,
    [GenreId] INT,
    [Composer] NVARCHAR(220),
    [Milliseconds] INT NOT NULL,
    [Bytes] INT,
    [UnitPrice] NUMERIC(10,2) NOT NULL,
    CONSTRAINT [PK_Track] PRIMARY KEY CLUSTERED ([TrackId])
);

-- Intentionally has NO PK and NO FK constraints
CREATE TABLE TrackReview (
    ReviewId INT NOT NULL,               -- unique within this table, but no PK constraint
    TrackId INT NOT NULL,                 -- matches Track.TrackId logically, but no FK constraint
    ReviewerName NVARCHAR(100) NOT NULL,  -- matches Customer's full name logically, no FK
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    ReviewText NVARCHAR(1000),
    ReviewDate DATETIME NOT NULL
);

CREATE TABLE SystemLog (
    LogId INT NOT NULL,
    InvoiceId INT NOT NULL,
    LogDate DATETIME NOT NULL,
    LogMessage NVARCHAR(MAX),
    CONSTRAINT [PK_SystemLog] PRIMARY KEY CLUSTERED ([LogId]),
    CONSTRAINT FK_SystemLog_Invoice FOREIGN KEY (InvoiceId)
        REFERENCES Invoice (InvoiceId)
);

CREATE TABLE AppConfig (
    ConfigId INT NOT NULL,
    ConfigKey NVARCHAR(50) NOT NULL,
    ConfigValue NVARCHAR(200) NOT NULL,
    CONSTRAINT [PK_AppConfig] PRIMARY KEY CLUSTERED ([ConfigId])
);

GO


/*******************************************************************************
   Create Primary Key Unique Indexes
********************************************************************************/

/*******************************************************************************
   Create Foreign Keys
********************************************************************************/
ALTER TABLE [dbo].[Album] ADD CONSTRAINT [FK_AlbumArtistId]
    FOREIGN KEY ([ArtistId]) REFERENCES [dbo].[Artist] ([ArtistId]) ON DELETE NO ACTION ON UPDATE NO ACTION;
GO
CREATE INDEX [IFK_AlbumArtistId] ON [dbo].[Album] ([ArtistId]);
GO
ALTER TABLE [dbo].[Customer] ADD CONSTRAINT [FK_CustomerSupportRepId]
    FOREIGN KEY ([SupportRepId]) REFERENCES [dbo].[Employee] ([EmployeeId]) ON DELETE NO ACTION ON UPDATE NO ACTION;
GO
CREATE INDEX [IFK_CustomerSupportRepId] ON [dbo].[Customer] ([SupportRepId]);
GO
ALTER TABLE [dbo].[Employee] ADD CONSTRAINT [FK_EmployeeReportsTo]
    FOREIGN KEY ([ReportsTo]) REFERENCES [dbo].[Employee] ([EmployeeId]) ON DELETE NO ACTION ON UPDATE NO ACTION;
GO
CREATE INDEX [IFK_EmployeeReportsTo] ON [dbo].[Employee] ([ReportsTo]);
GO
ALTER TABLE [dbo].[Invoice] ADD CONSTRAINT [FK_InvoiceCustomerId]
    FOREIGN KEY ([CustomerId]) REFERENCES [dbo].[Customer] ([CustomerId]) ON DELETE NO ACTION ON UPDATE NO ACTION;
GO
CREATE INDEX [IFK_InvoiceCustomerId] ON [dbo].[Invoice] ([CustomerId]);
GO
ALTER TABLE [dbo].[InvoiceLine] ADD CONSTRAINT [FK_InvoiceLineInvoiceId]
    FOREIGN KEY ([InvoiceId]) REFERENCES [dbo].[Invoice] ([InvoiceId]) ON DELETE NO ACTION ON UPDATE NO ACTION;
GO
CREATE INDEX [IFK_InvoiceLineInvoiceId] ON [dbo].[InvoiceLine] ([InvoiceId]);
GO
ALTER TABLE [dbo].[InvoiceLine] ADD CONSTRAINT [FK_InvoiceLineTrackId]
    FOREIGN KEY ([TrackId]) REFERENCES [dbo].[Track] ([TrackId]) ON DELETE NO ACTION ON UPDATE NO ACTION;
GO
CREATE INDEX [IFK_InvoiceLineTrackId] ON [dbo].[InvoiceLine] ([TrackId]);
GO
ALTER TABLE [dbo].[PlaylistTrack] ADD CONSTRAINT [FK_PlaylistTrackPlaylistId]
    FOREIGN KEY ([PlaylistId]) REFERENCES [dbo].[Playlist] ([PlaylistId]) ON DELETE NO ACTION ON UPDATE NO ACTION;
GO
CREATE INDEX [IFK_PlaylistTrackPlaylistId] ON [dbo].[PlaylistTrack] ([PlaylistId]);
GO
ALTER TABLE [dbo].[PlaylistTrack] ADD CONSTRAINT [FK_PlaylistTrackTrackId]
    FOREIGN KEY ([TrackId]) REFERENCES [dbo].[Track] ([TrackId]) ON DELETE NO ACTION ON UPDATE NO ACTION;
GO
CREATE INDEX [IFK_PlaylistTrackTrackId] ON [dbo].[PlaylistTrack] ([TrackId]);
GO
ALTER TABLE [dbo].[Track] ADD CONSTRAINT [FK_TrackAlbumId]
    FOREIGN KEY ([AlbumId]) REFERENCES [dbo].[Album] ([AlbumId]) ON DELETE NO ACTION ON UPDATE NO ACTION;
GO
CREATE INDEX [IFK_TrackAlbumId] ON [dbo].[Track] ([AlbumId]);
GO
ALTER TABLE [dbo].[Track] ADD CONSTRAINT [FK_TrackGenreId]
    FOREIGN KEY ([GenreId]) REFERENCES [dbo].[Genre] ([GenreId]) ON DELETE NO ACTION ON UPDATE NO ACTION;
GO
CREATE INDEX [IFK_TrackGenreId] ON [dbo].[Track] ([GenreId]);
GO
ALTER TABLE [dbo].[Track] ADD CONSTRAINT [FK_TrackMediaTypeId]
    FOREIGN KEY ([MediaTypeId]) REFERENCES [dbo].[MediaType] ([MediaTypeId]) ON DELETE NO ACTION ON UPDATE NO ACTION;
GO
CREATE INDEX [IFK_TrackMediaTypeId] ON [dbo].[Track] ([MediaTypeId]);
GO

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- 1. Invoice Report 
IF OBJECT_ID('sp_InvoiceReport', 'P') IS NOT NULL
    DROP PROCEDURE sp_InvoiceReport;
GO

CREATE PROCEDURE sp_InvoiceReport
    @InvoiceId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Simulate a junior developer's approach with inefficient queries
    -- Multiple unnecessary subqueries and cross joins
    SELECT DISTINCT
        t.TrackId,
        t.Name AS TrackName,
        t.Composer,
        t.GenreId,
        t.Milliseconds,
        (SELECT TOP 1 UnitPrice FROM InvoiceLine 
         WHERE InvoiceId = @InvoiceId AND TrackId = t.TrackId) AS UnitPrice,
        (SELECT TOP 1 Quantity FROM InvoiceLine 
         WHERE InvoiceId = @InvoiceId AND TrackId = t.TrackId) AS Quantity,
        -- Unnecessary subqueries for demo purposes
        (SELECT COUNT(*) FROM Album WHERE AlbumId = t.AlbumId) AS AlbumTrackCount,
        (SELECT Name FROM Genre WHERE GenreId = t.GenreId) AS GenreName
    FROM Track t
    CROSS JOIN Invoice i2
    WHERE t.TrackId IN (
        SELECT DISTINCT il2.TrackId
        FROM InvoiceLine il2
        WHERE il2.InvoiceId = @InvoiceId
        AND EXISTS (
            SELECT 1 FROM Invoice i3 
            WHERE i3.InvoiceId = il2.InvoiceId
            AND i3.InvoiceId = @InvoiceId
        )
    )
    AND EXISTS (
        SELECT 1 FROM InvoiceLine il3
        WHERE il3.TrackId = t.TrackId
        AND il3.InvoiceId = @InvoiceId
    )
    AND i2.InvoiceId = @InvoiceId
    AND EXISTS (
        SELECT 1 FROM InvoiceLine il4
        WHERE il4.InvoiceId = @InvoiceId
        AND il4.TrackId = t.TrackId
    );
    
    -- Add artificial delay for demonstration
    WAITFOR DELAY '00:00:02';
END;
GO

-- 2. Customer Summary
IF OBJECT_ID('sp_CustomerSummary', 'P') IS NOT NULL
    DROP PROCEDURE sp_CustomerSummary;
GO

CREATE PROCEDURE sp_CustomerSummary
    @CustomerId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        c.CustomerId,
        c.FirstName + ' ' + c.LastName AS FullName,
        c.Email,
        c.Country,
        COUNT(i.InvoiceId) AS TotalInvoices,
        ISNULL(SUM(i.Total), 0) AS TotalSpent,
        ISNULL(AVG(i.Total), 0) AS AverageOrderValue,
        MAX(i.InvoiceDate) AS LastPurchaseDate,
        (SELECT COUNT(*) FROM InvoiceLine il 
         JOIN Invoice i2 ON il.InvoiceId = i2.InvoiceId 
         WHERE i2.CustomerId = c.CustomerId) AS TotalItemsPurchased
    FROM Customer c
    LEFT JOIN Invoice i ON c.CustomerId = i.CustomerId
    WHERE c.CustomerId = @CustomerId
    GROUP BY c.CustomerId, c.FirstName, c.LastName, c.Email, c.Country;
END;
GO

-- 3. Top Tracks
IF OBJECT_ID('sp_TopTracks', 'P') IS NOT NULL
    DROP PROCEDURE sp_TopTracks;
GO

CREATE PROCEDURE sp_TopTracks
    @TopCount INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT TOP (@TopCount)
        t.TrackId,
        t.Name AS TrackName,
        a.Title AS AlbumTitle,
        ar.Name AS ArtistName,
        g.Name AS GenreName,
        COUNT(il.InvoiceLineId) AS TimesPurchased,
        SUM(il.Quantity) AS TotalQuantitySold,
        SUM(il.UnitPrice * il.Quantity) AS TotalRevenue
    FROM Track t
    JOIN Album a ON t.AlbumId = a.AlbumId
    JOIN Artist ar ON a.ArtistId = ar.ArtistId
    JOIN Genre g ON t.GenreId = g.GenreId
    LEFT JOIN InvoiceLine il ON t.TrackId = il.TrackId
    GROUP BY t.TrackId, t.Name, a.Title, ar.Name, g.Name
    ORDER BY TimesPurchased DESC, TotalRevenue DESC;
END;
GO

-- 4. Sales Report
IF OBJECT_ID('sp_SalesReport', 'P') IS NOT NULL
    DROP PROCEDURE sp_SalesReport;
GO

CREATE PROCEDURE sp_SalesReport
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Default to last 30 days if no dates provided
    IF @StartDate IS NULL SET @StartDate = DATEADD(DAY, -30, GETDATE());
    IF @EndDate IS NULL SET @EndDate = GETDATE();
    
    SELECT 
        CAST(i.InvoiceDate AS DATE) AS SaleDate,
        COUNT(i.InvoiceId) AS InvoiceCount,
        SUM(i.Total) AS DailyRevenue,
        AVG(i.Total) AS AverageInvoiceValue,
        COUNT(DISTINCT i.CustomerId) AS UniqueCustomers,
        SUM(il.Quantity) AS ItemsSold
    FROM Invoice i
    JOIN InvoiceLine il ON i.InvoiceId = il.InvoiceId
    WHERE i.InvoiceDate BETWEEN @StartDate AND @EndDate
    GROUP BY CAST(i.InvoiceDate AS DATE)
    ORDER BY SaleDate DESC;
END;
GO

-- 5. Employee Stats
IF OBJECT_ID('sp_EmployeeStats', 'P') IS NOT NULL
    DROP PROCEDURE sp_EmployeeStats;
GO

CREATE PROCEDURE sp_EmployeeStats
    @EmployeeId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        e.EmployeeId,
        e.FirstName + ' ' + e.LastName AS FullName,
        e.Title,
        COUNT(c.CustomerId) AS CustomersSupported,
        COUNT(i.InvoiceId) AS TotalInvoices,
        ISNULL(SUM(i.Total), 0) AS TotalSalesGenerated,
        ISNULL(AVG(i.Total), 0) AS AverageInvoiceValue
    FROM Employee e
    LEFT JOIN Customer c ON e.EmployeeId = c.SupportRepId
    LEFT JOIN Invoice i ON c.CustomerId = i.CustomerId
    WHERE (@EmployeeId IS NULL OR e.EmployeeId = @EmployeeId)
    GROUP BY e.EmployeeId, e.FirstName, e.LastName, e.Title
    ORDER BY TotalSalesGenerated DESC;
END;
GO

-- ============================================================================
-- VIEWS
-- ============================================================================

-- 1. Customer Invoice Summary View
IF OBJECT_ID('vw_CustomerInvoiceSummary', 'V') IS NOT NULL
    DROP VIEW vw_CustomerInvoiceSummary;
GO

CREATE VIEW vw_CustomerInvoiceSummary AS
SELECT 
    c.CustomerId,
    c.FirstName + ' ' + c.LastName AS CustomerName,
    c.Email,
    c.Country,
    c.City,
    COUNT(i.InvoiceId) AS TotalInvoices,
    ISNULL(SUM(i.Total), 0) AS TotalSpent,
    ISNULL(AVG(i.Total), 0) AS AverageOrderValue,
    MIN(i.InvoiceDate) AS FirstPurchase,
    MAX(i.InvoiceDate) AS LastPurchase,
    DATEDIFF(DAY, MIN(i.InvoiceDate), MAX(i.InvoiceDate)) AS CustomerLifespanDays
FROM Customer c
LEFT JOIN Invoice i ON c.CustomerId = i.CustomerId
GROUP BY c.CustomerId, c.FirstName, c.LastName, c.Email, c.Country, c.City;
GO

-- 2. Track Popularity View
IF OBJECT_ID('vw_TrackPopularity', 'V') IS NOT NULL
    DROP VIEW vw_TrackPopularity;
GO

CREATE VIEW vw_TrackPopularity AS
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
GO

-- 3. Monthly Revenue View
IF OBJECT_ID('vw_MonthlyRevenue', 'V') IS NOT NULL
    DROP VIEW vw_MonthlyRevenue;
GO

CREATE VIEW vw_MonthlyRevenue AS
SELECT 
    YEAR(i.InvoiceDate) AS RevenueYear,
    MONTH(i.InvoiceDate) AS RevenueMonth,
    DATENAME(MONTH, i.InvoiceDate) AS MonthName,
    COUNT(i.InvoiceId) AS InvoiceCount,
    SUM(i.Total) AS MonthlyRevenue,
    AVG(i.Total) AS AverageInvoiceValue,
    COUNT(DISTINCT i.CustomerId) AS UniqueCustomers,
    SUM(il.Quantity) AS ItemsSold
FROM Invoice i
JOIN InvoiceLine il ON i.InvoiceId = il.InvoiceId
GROUP BY YEAR(i.InvoiceDate), MONTH(i.InvoiceDate), DATENAME(MONTH, i.InvoiceDate);
GO

-- 4. Employee Performance View
IF OBJECT_ID('vw_EmployeePerformance', 'V') IS NOT NULL
    DROP VIEW vw_EmployeePerformance;
GO

CREATE VIEW vw_EmployeePerformance AS
SELECT 
    e.EmployeeId,
    e.FirstName + ' ' + e.LastName AS EmployeeName,
    e.Title,
    COUNT(DISTINCT c.CustomerId) AS CustomersSupported,
    COUNT(i.InvoiceId) AS TotalInvoices,
    ISNULL(SUM(i.Total), 0) AS TotalSalesGenerated,
    ISNULL(AVG(i.Total), 0) AS AverageInvoiceValue,
    CASE 
        WHEN COUNT(i.InvoiceId) > 50 THEN 'High Performer'
        WHEN COUNT(i.InvoiceId) > 20 THEN 'Good Performer'
        ELSE 'Developing'
    END AS PerformanceCategory
FROM Employee e
LEFT JOIN Customer c ON e.EmployeeId = c.SupportRepId
LEFT JOIN Invoice i ON c.CustomerId = i.CustomerId
GROUP BY e.EmployeeId, e.FirstName, e.LastName, e.Title;
GO

-- 5. Genre Statistics View
IF OBJECT_ID('vw_GenreStatistics', 'V') IS NOT NULL
    DROP VIEW vw_GenreStatistics;
GO

CREATE VIEW vw_GenreStatistics AS
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
GO