-- =================================================
-- OPTIMIZE STORED PROCEDURE DURING DEMO
-- =================================================
-- This script replaces sp_InvoiceReport with an optimized version
CREATE OR ALTER PROCEDURE sp_InvoiceReport
    @InvoiceId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    PRINT 'Running OPTIMIZED version of sp_InvoiceReport...';
    
    -- First, return customer and invoice information (same as slow version)
    SELECT 
        c.CustomerId,
        c.FirstName,
        c.LastName,
        c.Email,
        c.Company,
        c.Address,
        c.City,
        c.State,
        c.Country,
        c.PostalCode,
        c.Phone,
        c.Fax,
        i.InvoiceId,
        i.InvoiceDate,
        i.BillingAddress,
        i.BillingCity,
        i.BillingState,
        i.BillingCountry,
        i.BillingPostalCode,
        i.Total
    FROM Invoice i
    INNER JOIN Customer c ON i.CustomerId = c.CustomerId
    WHERE i.InvoiceId = @InvoiceId;
    
    -- Second, return track information with OPTIMIZED PERFORMANCE
    -- Fixes applied:
    -- 1. Proper INNER JOINs instead of CROSS JOIN + WHERE
    -- 2. Removed unnecessary subqueries and extra columns
    -- 3. Removed redundant JOINs and conditions
    -- 4. Removed unnecessary DISTINCT
    -- 5. Simplified SELECT clause and ORDER BY
    -- 6. Removed artificial delay
    SELECT 
        t.TrackId,
        t.Name as TrackName,
        t.Composer,
        t.GenreId,
        t.Milliseconds,
        il.UnitPrice,
        il.Quantity
    FROM InvoiceLine il
    INNER JOIN Track t ON il.TrackId = t.TrackId
    WHERE il.InvoiceId = @InvoiceId
    ORDER BY t.Name;
    
END
GO