-- /*******************************************************************************
--   Chinook Database 
--   Description: Creates and populates the Chinook database.
--   DB Server: MySQL 8.0+
--   Original Author: Luis Rocha (Evolved by Chris Hawkins at Redgate Software Ltd)
--   License: https://github.com/lerocha/chinook-database/blob/master/LICENSE.md

--   Version: 1.0.0
--   Last Updated: 2026-02-05
--   Update Notes: Added named constraints for all tables
-- ********************************************************************************/

-- Optional: create and use a database
-- CREATE DATABASE IF NOT EXISTS chinook DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
-- USE chinook;

-- Chinook MySQL (utf8mb4)
SET NAMES utf8mb4;
SET @old_fk_checks = @@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS = 0;
SET @old_unique_checks = @@UNIQUE_CHECKS, UNIQUE_CHECKS = 0;
SET @old_sql_notes = @@sql_notes, sql_notes = 0;
START TRANSACTION;

/*******************************************************************************
   Create Tables
********************************************************************************/
CREATE TABLE `Album`
(
    `AlbumId` INT NOT NULL AUTO_INCREMENT,
    `Title` VARCHAR(160) NOT NULL,
    `ArtistId` INT NOT NULL,
    CONSTRAINT `PK_Album` PRIMARY KEY  (`AlbumId`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Artist`
(
    `ArtistId` INT NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(120),
    CONSTRAINT `PK_Artist` PRIMARY KEY  (`ArtistId`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Customer`
(
    `CustomerId` INT NOT NULL AUTO_INCREMENT,
    `FirstName` VARCHAR(40) NOT NULL,
    `LastName` VARCHAR(20) NOT NULL,
    `Company` VARCHAR(80),
    `Address` VARCHAR(70),
    `City` VARCHAR(40),
    `State` VARCHAR(40),
    `Country` VARCHAR(40),
    `PostalCode` VARCHAR(10),
    `Phone` VARCHAR(24),
    `Fax` VARCHAR(24),
    `Email` VARCHAR(60) NOT NULL,
    `SupportRepId` INT,
    CONSTRAINT `PK_Customer` PRIMARY KEY  (`CustomerId`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Employee`
(
    `EmployeeId` INT NOT NULL AUTO_INCREMENT,
    `LastName` VARCHAR(20) NOT NULL,
    `FirstName` VARCHAR(20) NOT NULL,
    `Title` VARCHAR(30),
    `ReportsTo` INT,
    `BirthDate` DATETIME,
    `HireDate` DATETIME,
    `Address` VARCHAR(70),
    `City` VARCHAR(40),
    `State` VARCHAR(40),
    `Country` VARCHAR(40),
    `PostalCode` VARCHAR(10),
    `Phone` VARCHAR(24),
    `Fax` VARCHAR(24),
    `Email` VARCHAR(60),
    CONSTRAINT `PK_Employee` PRIMARY KEY  (`EmployeeId`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Genre`
(
    `GenreId` INT NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(120),
    CONSTRAINT `PK_Genre` PRIMARY KEY  (`GenreId`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Invoice`
(
    `InvoiceId` INT NOT NULL AUTO_INCREMENT,
    `CustomerId` INT NOT NULL,
    `InvoiceDate` DATETIME NOT NULL,
    `BillingAddress` VARCHAR(70),
    `BillingCity` VARCHAR(40),
    `BillingState` VARCHAR(40),
    `BillingCountry` VARCHAR(40),
    `BillingPostalCode` VARCHAR(10),
    `Total` DECIMAL(10,2) NOT NULL,
    CONSTRAINT `PK_Invoice` PRIMARY KEY  (`InvoiceId`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `InvoiceLine`
(
    `InvoiceLineId` INT NOT NULL AUTO_INCREMENT,
    `InvoiceId` INT NOT NULL,
    `TrackId` INT NOT NULL,
    `UnitPrice` DECIMAL(10,2) NOT NULL,
    `Quantity` INT NOT NULL,
    CONSTRAINT `PK_InvoiceLine` PRIMARY KEY  (`InvoiceLineId`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `MediaType`
(
    `MediaTypeId` INT NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(120),
    CONSTRAINT `PK_MediaType` PRIMARY KEY  (`MediaTypeId`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Playlist`
(
    `PlaylistId` INT NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(120),
    CONSTRAINT `PK_Playlist` PRIMARY KEY  (`PlaylistId`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `PlaylistTrack`
(
    `PlaylistId` INT NOT NULL,
    `TrackId` INT NOT NULL,
    CONSTRAINT `PK_PlaylistTrack` PRIMARY KEY  (`PlaylistId`, `TrackId`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Track`
(
    `TrackId` INT NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(200) NOT NULL,
    `AlbumId` INT,
    `MediaTypeId` INT NOT NULL,
    `GenreId` INT,
    `Composer` VARCHAR(220),
    `Milliseconds` INT NOT NULL,
    `Bytes` INT,
    `UnitPrice` DECIMAL(10,2) NOT NULL,
    CONSTRAINT `PK_Track` PRIMARY KEY  (`TrackId`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `TrackReview` (
    `ReviewId` INT AUTO_INCREMENT NOT NULL,
    `TrackId` INT NOT NULL,
    `ReviewerName` VARCHAR(100) NOT NULL,
    `Rating` INT,
    `ReviewText` VARCHAR(1000),
    `ReviewDate` DATE NOT NULL,
    CONSTRAINT `PK_TrackReview` PRIMARY KEY (`ReviewId`),
    CONSTRAINT `CK_TrackReview_Rating` CHECK (`Rating` BETWEEN 1 AND 5)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `AppConfig` (
    `ConfigId` INT AUTO_INCREMENT NOT NULL,
    `ConfigKey` VARCHAR(50) NOT NULL,
    `ConfigValue` VARCHAR(200) NOT NULL,
    CONSTRAINT `PK_AppConfig` PRIMARY KEY (`ConfigId`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `SystemLog` (
    `LogId` INT AUTO_INCREMENT NOT NULL,
    `InvoiceId` INT NOT NULL,
    `LogDate` DATETIME NOT NULL,
    `LogMessage` TEXT,
    CONSTRAINT `PK_SystemLog` PRIMARY KEY (`LogId`),
    CONSTRAINT `fk_SystemLog_Invoice` FOREIGN KEY (`InvoiceId`)
        REFERENCES `Invoice`(`InvoiceId`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*******************************************************************************
   Create Primary Key Unique Indexes
********************************************************************************/

/*******************************************************************************
   Create Foreign Keys
********************************************************************************/
ALTER TABLE `Album` ADD CONSTRAINT `FK_AlbumArtistId`
    FOREIGN KEY (`ArtistId`) REFERENCES `Artist` (`ArtistId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE INDEX `IFK_AlbumArtistId` ON `Album` (`ArtistId`);

ALTER TABLE `Customer` ADD CONSTRAINT `FK_CustomerSupportRepId`
    FOREIGN KEY (`SupportRepId`) REFERENCES `Employee` (`EmployeeId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE INDEX `IFK_CustomerSupportRepId` ON `Customer` (`SupportRepId`);

ALTER TABLE `Employee` ADD CONSTRAINT `FK_EmployeeReportsTo`
    FOREIGN KEY (`ReportsTo`) REFERENCES `Employee` (`EmployeeId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE INDEX `IFK_EmployeeReportsTo` ON `Employee` (`ReportsTo`);

ALTER TABLE `Invoice` ADD CONSTRAINT `FK_InvoiceCustomerId`
    FOREIGN KEY (`CustomerId`) REFERENCES `Customer` (`CustomerId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE INDEX `IFK_InvoiceCustomerId` ON `Invoice` (`CustomerId`);

ALTER TABLE `InvoiceLine` ADD CONSTRAINT `FK_InvoiceLineInvoiceId`
    FOREIGN KEY (`InvoiceId`) REFERENCES `Invoice` (`InvoiceId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE INDEX `IFK_InvoiceLineInvoiceId` ON `InvoiceLine` (`InvoiceId`);

ALTER TABLE `InvoiceLine` ADD CONSTRAINT `FK_InvoiceLineTrackId`
    FOREIGN KEY (`TrackId`) REFERENCES `Track` (`TrackId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE INDEX `IFK_InvoiceLineTrackId` ON `InvoiceLine` (`TrackId`);

ALTER TABLE `PlaylistTrack` ADD CONSTRAINT `FK_PlaylistTrackPlaylistId`
    FOREIGN KEY (`PlaylistId`) REFERENCES `Playlist` (`PlaylistId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE INDEX `IFK_PlaylistTrackPlaylistId` ON `PlaylistTrack` (`PlaylistId`);

ALTER TABLE `PlaylistTrack` ADD CONSTRAINT `FK_PlaylistTrackTrackId`
    FOREIGN KEY (`TrackId`) REFERENCES `Track` (`TrackId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE INDEX `IFK_PlaylistTrackTrackId` ON `PlaylistTrack` (`TrackId`);

ALTER TABLE `Track` ADD CONSTRAINT `FK_TrackAlbumId`
    FOREIGN KEY (`AlbumId`) REFERENCES `Album` (`AlbumId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE INDEX `IFK_TrackAlbumId` ON `Track` (`AlbumId`);

ALTER TABLE `Track` ADD CONSTRAINT `FK_TrackGenreId`
    FOREIGN KEY (`GenreId`) REFERENCES `Genre` (`GenreId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE INDEX `IFK_TrackGenreId` ON `Track` (`GenreId`);

ALTER TABLE `Track` ADD CONSTRAINT `FK_TrackMediaTypeId`
    FOREIGN KEY (`MediaTypeId`) REFERENCES `MediaType` (`MediaTypeId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE INDEX `IFK_TrackMediaTypeId` ON `Track` (`MediaTypeId`);

DELIMITER //

DROP PROCEDURE IF EXISTS sp_InvoiceReport//

CREATE PROCEDURE sp_InvoiceReport(IN p_InvoiceId INT)
BEGIN
    DO SLEEP(2);
    
    SELECT DISTINCT
        t.TrackId,
        t.Name AS TrackName,
        t.Composer,
        t.GenreId,
        t.Milliseconds,
        il.UnitPrice,
        il.Quantity,
        (SELECT COUNT(*) FROM Track t2 WHERE t2.AlbumId = t.AlbumId) AS AlbumTrackCount,
        (SELECT g.Name FROM Genre g WHERE g.GenreId = t.GenreId) AS GenreName
    FROM Track t
    JOIN InvoiceLine il ON il.TrackId = t.TrackId 
    WHERE il.InvoiceId = p_InvoiceId;
END//

DROP PROCEDURE IF EXISTS sp_CustomerSummary//

CREATE PROCEDURE sp_CustomerSummary(IN p_CustomerId INT)
BEGIN
    SELECT 
        c.CustomerId,
        CONCAT(c.FirstName, ' ', c.LastName) AS FullName,
        c.Email,
        c.Country,
        COUNT(i.InvoiceId) AS TotalInvoices,
        IFNULL(SUM(i.Total), 0) AS TotalSpent,
        IFNULL(AVG(i.Total), 0) AS AverageOrderValue,
        MAX(i.InvoiceDate) AS LastPurchaseDate,
        (SELECT COUNT(*) FROM InvoiceLine il 
         JOIN Invoice i2 ON il.InvoiceId = i2.InvoiceId 
         WHERE i2.CustomerId = c.CustomerId) AS TotalItemsPurchased
    FROM Customer c
    LEFT JOIN Invoice i ON c.CustomerId = i.CustomerId
    WHERE c.CustomerId = p_CustomerId
    GROUP BY c.CustomerId, c.FirstName, c.LastName, c.Email, c.Country;
END//

DROP PROCEDURE IF EXISTS sp_TopTracks//

CREATE PROCEDURE sp_TopTracks(IN p_TopCount INT)
BEGIN
    IF p_TopCount IS NULL THEN
        SET p_TopCount = 10;
    END IF;
    
    SELECT 
        t.TrackId,
        t.Name AS TrackName,
        a.Title AS AlbumTitle,
        ar.Name AS ArtistName,
        g.Name AS GenreName,
        COUNT(il.InvoiceLineId) AS TimesPurchased,
        IFNULL(SUM(il.Quantity), 0) AS TotalQuantitySold,
        IFNULL(SUM(il.UnitPrice * il.Quantity), 0) AS TotalRevenue
    FROM Track t
    JOIN Album a ON t.AlbumId = a.AlbumId
    JOIN Artist ar ON a.ArtistId = ar.ArtistId
    JOIN Genre g ON t.GenreId = g.GenreId
    LEFT JOIN InvoiceLine il ON t.TrackId = il.TrackId
    GROUP BY t.TrackId, t.Name, a.Title, ar.Name, g.Name
    ORDER BY TimesPurchased DESC, TotalRevenue DESC
    LIMIT p_TopCount;
END//

DROP PROCEDURE IF EXISTS sp_SalesReport//

CREATE PROCEDURE sp_SalesReport(IN p_StartDate DATE, IN p_EndDate DATE)
BEGIN
    IF p_StartDate IS NULL THEN
        SET p_StartDate = DATE_SUB(CURDATE(), INTERVAL 30 DAY);
    END IF;
    IF p_EndDate IS NULL THEN
        SET p_EndDate = CURDATE();
    END IF;
    
    SELECT 
        DATE(i.InvoiceDate) AS SaleDate,
        COUNT(i.InvoiceId) AS InvoiceCount,
        SUM(i.Total) AS DailyRevenue,
        AVG(i.Total) AS AverageInvoiceValue,
        COUNT(DISTINCT i.CustomerId) AS UniqueCustomers,
        SUM(il.Quantity) AS ItemsSold
    FROM Invoice i
    JOIN InvoiceLine il ON i.InvoiceId = il.InvoiceId
    WHERE DATE(i.InvoiceDate) BETWEEN p_StartDate AND p_EndDate
    GROUP BY DATE(i.InvoiceDate)
    ORDER BY SaleDate DESC;
END//

DROP PROCEDURE IF EXISTS sp_EmployeeStats//

CREATE PROCEDURE sp_EmployeeStats(IN p_EmployeeId INT)
BEGIN
    SELECT 
        e.EmployeeId,
        CONCAT(e.FirstName, ' ', e.LastName) AS FullName,
        e.Title,
        COUNT(DISTINCT c.CustomerId) AS CustomersSupported,
        COUNT(i.InvoiceId) AS TotalInvoices,
        IFNULL(SUM(i.Total), 0) AS TotalSalesGenerated,
        IFNULL(AVG(i.Total), 0) AS AverageInvoiceValue
    FROM Employee e
    LEFT JOIN Customer c ON e.EmployeeId = c.SupportRepId
    LEFT JOIN Invoice i ON c.CustomerId = i.CustomerId
    WHERE (p_EmployeeId IS NULL OR e.EmployeeId = p_EmployeeId)
    GROUP BY e.EmployeeId, e.FirstName, e.LastName, e.Title
    ORDER BY TotalSalesGenerated DESC;
END//

DELIMITER ;

DROP VIEW IF EXISTS vw_CustomerInvoiceSummary;

CREATE VIEW vw_CustomerInvoiceSummary AS
SELECT 
    c.CustomerId,
    CONCAT(c.FirstName, ' ', c.LastName) AS CustomerName,
    c.Email,
    c.Country,
    c.City,
    IFNULL(inv_summary.TotalInvoices, 0) AS TotalInvoices,
    IFNULL(inv_summary.TotalSpent, 0) AS TotalSpent,
    IFNULL(inv_summary.AverageOrderValue, 0) AS AverageOrderValue,
    inv_summary.FirstPurchase,
    inv_summary.LastPurchase,
    IFNULL(DATEDIFF(inv_summary.LastPurchase, inv_summary.FirstPurchase), 0) AS CustomerLifespanDays
FROM Customer c
LEFT JOIN (
    SELECT 
        i.CustomerId,
        COUNT(i.InvoiceId) AS TotalInvoices,
        SUM(i.Total) AS TotalSpent,
        AVG(i.Total) AS AverageOrderValue,
        MIN(i.InvoiceDate) AS FirstPurchase,
        MAX(i.InvoiceDate) AS LastPurchase
    FROM Invoice i
    GROUP BY i.CustomerId
) inv_summary ON c.CustomerId = inv_summary.CustomerId;

DROP VIEW IF EXISTS vw_TrackPopularity;

CREATE VIEW vw_TrackPopularity AS
SELECT 
    t.TrackId,
    t.Name AS TrackName,
    a.Title AS AlbumTitle,
    ar.Name AS ArtistName,
    g.Name AS GenreName,
    t.Milliseconds,
    IFNULL(track_sales.TimesPurchased, 0) AS TimesPurchased,
    IFNULL(track_sales.TotalQuantitySold, 0) AS TotalQuantitySold,
    IFNULL(track_sales.TotalRevenue, 0) AS TotalRevenue,
    IFNULL(track_sales.AveragePrice, 0) AS AveragePrice
FROM Track t
JOIN Album a ON t.AlbumId = a.AlbumId
JOIN Artist ar ON a.ArtistId = ar.ArtistId
JOIN Genre g ON t.GenreId = g.GenreId
LEFT JOIN (
    SELECT 
        il.TrackId,
        COUNT(il.InvoiceLineId) AS TimesPurchased,
        SUM(il.Quantity) AS TotalQuantitySold,
        SUM(il.UnitPrice * il.Quantity) AS TotalRevenue,
        AVG(il.UnitPrice) AS AveragePrice
    FROM InvoiceLine il
    GROUP BY il.TrackId
) track_sales ON t.TrackId = track_sales.TrackId;

DROP VIEW IF EXISTS vw_MonthlyRevenue;

CREATE VIEW vw_MonthlyRevenue AS
SELECT 
    YEAR(i.InvoiceDate) AS RevenueYear,
    MONTH(i.InvoiceDate) AS RevenueMonth,
    MONTHNAME(i.InvoiceDate) AS MonthName,
    COUNT(i.InvoiceId) AS InvoiceCount,
    SUM(i.Total) AS MonthlyRevenue,
    AVG(i.Total) AS AverageInvoiceValue,
    COUNT(DISTINCT i.CustomerId) AS UniqueCustomers,
    IFNULL(line_summary.ItemsSold, 0) AS ItemsSold
FROM Invoice i
LEFT JOIN (
    SELECT 
        il.InvoiceId,
        SUM(il.Quantity) AS ItemsSold
    FROM InvoiceLine il
    GROUP BY il.InvoiceId
) line_summary ON i.InvoiceId = line_summary.InvoiceId
GROUP BY YEAR(i.InvoiceDate), MONTH(i.InvoiceDate), MONTHNAME(i.InvoiceDate);

DROP VIEW IF EXISTS vw_EmployeePerformance;

CREATE VIEW vw_EmployeePerformance AS
SELECT 
    e.EmployeeId,
    CONCAT(e.FirstName, ' ', e.LastName) AS EmployeeName,
    e.Title,
    IFNULL(emp_summary.CustomersSupported, 0) AS CustomersSupported,
    IFNULL(emp_summary.TotalInvoices, 0) AS TotalInvoices,
    IFNULL(emp_summary.TotalSalesGenerated, 0) AS TotalSalesGenerated,
    IFNULL(emp_summary.AverageInvoiceValue, 0) AS AverageInvoiceValue,
    CASE 
        WHEN IFNULL(emp_summary.TotalInvoices, 0) > 50 THEN 'High Performer'
        WHEN IFNULL(emp_summary.TotalInvoices, 0) > 20 THEN 'Good Performer'
        ELSE 'Developing'
    END AS PerformanceCategory
FROM Employee e
LEFT JOIN (
    SELECT 
        e_inner.EmployeeId,
        COUNT(DISTINCT c.CustomerId) AS CustomersSupported,
        COUNT(i.InvoiceId) AS TotalInvoices,
        SUM(i.Total) AS TotalSalesGenerated,
        AVG(i.Total) AS AverageInvoiceValue
    FROM Employee e_inner
    LEFT JOIN Customer c ON e_inner.EmployeeId = c.SupportRepId
    LEFT JOIN Invoice i ON c.CustomerId = i.CustomerId
    GROUP BY e_inner.EmployeeId
) emp_summary ON e.EmployeeId = emp_summary.EmployeeId;

DROP VIEW IF EXISTS vw_GenreStatistics;

CREATE VIEW vw_GenreStatistics AS
SELECT 
    g.GenreId,
    g.Name AS GenreName,
    IFNULL(genre_summary.TotalTracks, 0) AS TotalTracks,
    IFNULL(genre_summary.TotalAlbums, 0) AS TotalAlbums,
    IFNULL(genre_summary.TotalArtists, 0) AS TotalArtists,
    IFNULL(genre_summary.TimesPurchased, 0) AS TimesPurchased,
    IFNULL(genre_summary.TotalQuantitySold, 0) AS TotalQuantitySold,
    IFNULL(genre_summary.TotalRevenue, 0) AS TotalRevenue,
    IFNULL(genre_summary.AverageTrackPrice, 0) AS AverageTrackPrice
FROM Genre g
LEFT JOIN (
    SELECT 
        g_inner.GenreId,
        COUNT(DISTINCT t.TrackId) AS TotalTracks,
        COUNT(DISTINCT a.AlbumId) AS TotalAlbums,
        COUNT(DISTINCT ar.ArtistId) AS TotalArtists,
        COUNT(il.InvoiceLineId) AS TimesPurchased,
        SUM(il.Quantity) AS TotalQuantitySold,
        SUM(il.UnitPrice * il.Quantity) AS TotalRevenue,
        AVG(il.UnitPrice) AS AverageTrackPrice
    FROM Genre g_inner
    LEFT JOIN Track t ON g_inner.GenreId = t.GenreId
    LEFT JOIN Album a ON t.AlbumId = a.AlbumId
    LEFT JOIN Artist ar ON a.ArtistId = ar.ArtistId
    LEFT JOIN InvoiceLine il ON t.TrackId = il.TrackId
    GROUP BY g_inner.GenreId
) genre_summary ON g.GenreId = genre_summary.GenreId;

COMMIT;
SET FOREIGN_KEY_CHECKS = @old_fk_checks;
SET UNIQUE_CHECKS = @old_unique_checks;
SET sql_notes = @old_sql_notes;
