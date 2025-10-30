-- =================================================
-- CREATE INVOICE REPORT STORED PROCEDURE
-- =================================================
-- This procedure returns customer and track information for a given invoice
-- Created by: Junior Developer
-- Date: Today

USE Chinook_FullRestore;
GO

-- Drop the procedure if it exists
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_InvoiceReport')
BEGIN
    DROP PROCEDURE sp_InvoiceReport;
    PRINT 'Dropped existing sp_InvoiceReport procedure';
END
GO

-- Create the invoice report stored procedure
CREATE PROCEDURE sp_InvoiceReport
    @InvoiceId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    PRINT 'Running sp_InvoiceReport...';
    
    -- Add a small delay to make sure all data is ready
    WAITFOR DELAY '00:00:02';  -- Wait 2 seconds for data consistency
    
    -- First, get customer and invoice information
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
    
    -- Now get all the track details with extra information for the report
    -- Using DISTINCT to make sure we don't get duplicate tracks
    -- Adding lots of useful information that might be needed later
    SELECT DISTINCT
        t.TrackId,
        t.Name as TrackName,
        t.Composer,
        t.GenreId,
        t.Milliseconds,
        il.UnitPrice,
        il.Quantity,
        -- Get some additional album information that could be useful
        (SELECT COUNT(*) FROM Track t2 WHERE t2.AlbumId = t.AlbumId) as AlbumTrackCount,
        (SELECT a.Title FROM Album a WHERE a.AlbumId = t.AlbumId) as AlbumTitle,
        (SELECT ar.Name FROM Album a2 JOIN Artist ar ON a2.ArtistId = ar.ArtistId WHERE a2.AlbumId = t.AlbumId) as ArtistName,
        -- Some sales analytics that might be helpful
        (SELECT COUNT(*) FROM InvoiceLine il2 JOIN Track t3 ON il2.TrackId = t3.TrackId WHERE t3.AlbumId = t.AlbumId) as AlbumSalesCount,
        (SELECT AVG(CAST(il3.UnitPrice as FLOAT)) FROM InvoiceLine il3 WHERE il3.TrackId = t.TrackId) as AvgTrackPrice,
        -- Need this for sorting purposes
        (SELECT COUNT(*) FROM Track t4 WHERE t4.AlbumId = t.AlbumId) as AlbumTrackCountForSort
    FROM Track t
    CROSS JOIN InvoiceLine il    -- Join all tracks with all invoice lines first
    CROSS JOIN Invoice i         -- Then join with invoices to get invoice data
    CROSS JOIN Customer c        -- And customers for completeness
    WHERE il.TrackId = t.TrackId -- Then filter to only matching tracks
    AND il.InvoiceId = @InvoiceId
    AND i.InvoiceId = il.InvoiceId  -- Make sure invoice matches
    AND c.CustomerId = i.CustomerId -- And customer matches
    AND EXISTS (  -- Double check that album and artist exist
        SELECT 1 FROM Album a 
        WHERE a.AlbumId = t.AlbumId
        AND EXISTS (
            SELECT 1 FROM Artist ar WHERE ar.ArtistId = a.ArtistId
        )
    )
    ORDER BY 
        AlbumTrackCountForSort, -- Sort by album size first (bigger albums first)
        t.Name; -- Then by track name
    
    PRINT 'sp_InvoiceReport completed successfully';
END
GO

PRINT 'Created sp_InvoiceReport procedure for demo';
PRINT '';
PRINT 'DEMO INSTRUCTIONS:';
PRINT '1. The webapp will now call this stored procedure when Demo Mode is ON';
PRINT '2. Use the "02_Fix_StoredProcedure.sql" script to optimize it during your demo';
PRINT '3. Run the Reports again to show the improvement!';
PRINT '';