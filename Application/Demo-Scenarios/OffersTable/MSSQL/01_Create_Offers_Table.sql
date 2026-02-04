-- =============================================
-- Chinook Music Store - SQL Server Offers Table
-- =============================================
-- Creates an Offers table for demonstrating Flyway migrations
-- and the dynamic Offers tab functionality
-- =============================================

-- Drop table if it exists (for testing purposes)
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Offers]') AND type in (N'U'))
DROP TABLE [dbo].[Offers];
GO

-- Create Offers table with sample structure
CREATE TABLE [dbo].[Offers] (
    [OfferId] INT IDENTITY(1,1),
    [OfferName] NVARCHAR(255) NOT NULL,
    [Description] NVARCHAR(500),
    [DiscountPercent] DECIMAL(5,2),
    [StartDate] DATETIME2,
    [EndDate] DATETIME2,
    [IsActive] BIT DEFAULT 1,
    [Category] NVARCHAR(100),
    [MinimumPurchase] DECIMAL(10,2),
    [MaxUses] INT,
    [TimesUsed] INT DEFAULT 0,
    [CreatedDate] DATETIME2 DEFAULT GETDATE(),
    [CreatedBy] NVARCHAR(100) DEFAULT 'System',
    CONSTRAINT [PK_Offers] PRIMARY KEY ([OfferId])
);
GO

-- Insert sample data
INSERT INTO [dbo].[Offers] ([OfferName], [Description], [DiscountPercent], [StartDate], [EndDate], [IsActive], [Category], [MinimumPurchase], [MaxUses], [TimesUsed])
VALUES 
    ('Rock Music Sale', 'Special discount on all rock albums', 15.00, '2025-01-01', '2025-12-31', 1, 'Music', 10.00, 1000, 45),
    ('Jazz Collection Offer', 'Buy 2 jazz albums, get 20% off', 20.00, '2025-02-01', '2025-11-30', 1, 'Music', 25.00, 500, 12),
    ('Classical Premium', 'Premium classical music discount for members', 25.00, '2025-01-15', '2025-06-15', 1, 'Classical', 50.00, 200, 8),
    ('New Customer Welcome', 'Welcome offer for first-time customers', 10.00, '2025-01-01', '2025-12-31', 1, 'Welcome', 0.00, NULL, 156),
    ('Summer Festival Deal', 'Festival season special pricing', 30.00, '2025-06-01', '2025-08-31', 0, 'Seasonal', 75.00, 100, 0);
GO

-- Create index for better performance
CREATE NONCLUSTERED INDEX [IX_Offers_IsActive_Category] 
ON [dbo].[Offers] ([IsActive], [Category]);
GO

-- Display the created data
SELECT * FROM [dbo].[Offers] ORDER BY [OfferId];
GO

PRINT 'SQL Server Offers table created successfully with ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' sample records.';
PRINT 'Use this table to test the dynamic Offers functionality in the Chinook WebApp.';
GO