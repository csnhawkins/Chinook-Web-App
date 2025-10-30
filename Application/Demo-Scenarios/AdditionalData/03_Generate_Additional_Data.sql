-- ====================================
-- GENERATE ADDITIONAL TEST DATA
-- ====================================
-- This script generates additional customers, employees, and invoices
-- to provide more data for testing and demonstration purposes
-- 
-- CONFIGURABLE AMOUNTS:
-- - Set @CustomerCount for number of additional customers (default: 500)
-- - Set @EmployeeCount for number of additional employees (default: 20) 
-- - Set @InvoiceMultiplier for additional invoices per customer (default: 3)

USE Chinook_FullRestore;
GO

-- ===========================================
-- CONFIGURATION SECTION - ADJUST AS NEEDED
-- ===========================================
DECLARE @CustomerCount INT = 500;          -- Number of additional customers to create
DECLARE @EmployeeCount INT = 20;           -- Number of additional employees to create  
DECLARE @InvoiceMultiplier INT = 3;        -- Additional invoices per new customer
DECLARE @StartCustomerId INT;
DECLARE @StartEmployeeId INT;
DECLARE @Counter INT;

PRINT 'Starting test data generation...';
PRINT 'Configuration:';
PRINT '  - Additional Customers: ' + CAST(@CustomerCount AS VARCHAR(10));
PRINT '  - Additional Employees: ' + CAST(@EmployeeCount AS VARCHAR(10));
PRINT '  - Invoices per Customer: ' + CAST(@InvoiceMultiplier AS VARCHAR(10));
PRINT '';

-- Get starting IDs to avoid conflicts (for reference only - we'll let identity columns auto-generate)
SELECT @StartCustomerId = MAX(CustomerId) + 1 FROM Customer;
SELECT @StartEmployeeId = MAX(EmployeeId) + 1 FROM Employee;

PRINT 'Next available Customer ID: ' + CAST(@StartCustomerId AS VARCHAR(10)) + ' (will auto-generate)';
PRINT 'Starting Employee ID: ' + CAST(@StartEmployeeId AS VARCHAR(10));
PRINT '';

-- ===========================================
-- CREATE ADDITIONAL CUSTOMERS
-- ===========================================
PRINT 'Generating ' + CAST(@CustomerCount AS VARCHAR(10)) + ' additional customers...';

SET @Counter = 0;
WHILE @Counter < @CustomerCount
BEGIN
    DECLARE @FirstName VARCHAR(40);
    DECLARE @LastName VARCHAR(20);
    DECLARE @Email VARCHAR(60);
    DECLARE @Company VARCHAR(80);
    DECLARE @City VARCHAR(40);
    DECLARE @State VARCHAR(40);
    DECLARE @Country VARCHAR(40);
    DECLARE @Phone VARCHAR(24);
    
    -- Generate realistic names and data
    SET @FirstName = CASE (@Counter % 20)
        WHEN 0 THEN 'Michael' WHEN 1 THEN 'Sarah' WHEN 2 THEN 'David' WHEN 3 THEN 'Jessica'
        WHEN 4 THEN 'Robert' WHEN 5 THEN 'Ashley' WHEN 6 THEN 'John' WHEN 7 THEN 'Amanda'
        WHEN 8 THEN 'James' WHEN 9 THEN 'Jennifer' WHEN 10 THEN 'Christopher' WHEN 11 THEN 'Michelle'
        WHEN 12 THEN 'Daniel' WHEN 13 THEN 'Kimberly' WHEN 14 THEN 'Matthew' WHEN 15 THEN 'Amy'
        WHEN 16 THEN 'Anthony' WHEN 17 THEN 'Angela' WHEN 18 THEN 'Mark' ELSE 'Lisa'
    END;
    
    SET @LastName = CASE (@Counter % 25)
        WHEN 0 THEN 'Smith' WHEN 1 THEN 'Johnson' WHEN 2 THEN 'Williams' WHEN 3 THEN 'Brown'
        WHEN 4 THEN 'Jones' WHEN 5 THEN 'Garcia' WHEN 6 THEN 'Miller' WHEN 7 THEN 'Davis'
        WHEN 8 THEN 'Rodriguez' WHEN 9 THEN 'Martinez' WHEN 10 THEN 'Hernandez' WHEN 11 THEN 'Lopez'
        WHEN 12 THEN 'Gonzalez' WHEN 13 THEN 'Wilson' WHEN 14 THEN 'Anderson' WHEN 15 THEN 'Thomas'
        WHEN 16 THEN 'Taylor' WHEN 17 THEN 'Moore' WHEN 18 THEN 'Jackson' WHEN 19 THEN 'Martin'
        WHEN 20 THEN 'Lee' WHEN 21 THEN 'Perez' WHEN 22 THEN 'Thompson' WHEN 23 THEN 'White' ELSE 'Harris'
    END;
    
    SET @Email = LOWER(@FirstName + '.' + @LastName + CAST((@Counter % 1000) AS VARCHAR(3)) + '@email.com');
    
    SET @Company = CASE (@Counter % 15)
        WHEN 0 THEN 'Tech Solutions Inc' WHEN 1 THEN 'Global Industries' WHEN 2 THEN 'Innovation Corp'
        WHEN 3 THEN 'Digital Systems' WHEN 4 THEN 'Advanced Analytics' WHEN 5 THEN 'Smart Solutions'
        WHEN 6 THEN 'Future Technologies' WHEN 7 THEN 'Data Dynamics' WHEN 8 THEN 'Cloud Services'
        WHEN 9 THEN 'Business Intelligence' WHEN 10 THEN 'Enterprise Solutions' WHEN 11 THEN 'Modern Systems'
        WHEN 12 THEN 'Strategic Consulting' WHEN 13 THEN 'Innovative Designs' ELSE 'Professional Services'
    END;
    
    SET @City = CASE (@Counter % 12)
        WHEN 0 THEN 'New York' WHEN 1 THEN 'Los Angeles' WHEN 2 THEN 'Chicago' WHEN 3 THEN 'Houston'
        WHEN 4 THEN 'Phoenix' WHEN 5 THEN 'Philadelphia' WHEN 6 THEN 'San Antonio' WHEN 7 THEN 'San Diego'
        WHEN 8 THEN 'Dallas' WHEN 9 THEN 'San Jose' WHEN 10 THEN 'Austin' ELSE 'Jacksonville'
    END;
    
    SET @State = CASE (@Counter % 10)
        WHEN 0 THEN 'NY' WHEN 1 THEN 'CA' WHEN 2 THEN 'IL' WHEN 3 THEN 'TX'
        WHEN 4 THEN 'AZ' WHEN 5 THEN 'PA' WHEN 6 THEN 'FL' WHEN 7 THEN 'OH'
        WHEN 8 THEN 'NC' ELSE 'MI'
    END;
    
    SET @Country = CASE (@Counter % 5)
        WHEN 0 THEN 'USA' WHEN 1 THEN 'Canada' WHEN 2 THEN 'United Kingdom'
        WHEN 3 THEN 'Germany' ELSE 'France'
    END;
    
    SET @Phone = '+1 (' + CAST((200 + (@Counter % 800)) AS VARCHAR(3)) + ') ' + 
                 CAST((200 + (@Counter % 799)) AS VARCHAR(3)) + '-' +
                 CAST((1000 + (@Counter % 8999)) AS VARCHAR(4));
    
    -- Insert customer without specifying CustomerId (let identity column auto-generate)
    INSERT INTO Customer (FirstName, LastName, Company, Address, City, State, Country, PostalCode, Phone, Fax, Email, SupportRepId)
    VALUES (
        @FirstName,
        @LastName,
        @Company,
        CAST((100 + (@Counter % 9899)) AS VARCHAR(5)) + ' ' + @FirstName + ' Street',
        @City,
        @State,
        @Country,
        CAST((10000 + (@Counter % 89999)) AS VARCHAR(5)),
        @Phone,
        @Phone,
        @Email,
        ((@Counter % 8) + 1)  -- Assign to existing support reps (1-8)
    );
    
    SET @Counter = @Counter + 1;
    
    -- Progress indicator every 100 customers
    IF @Counter % 100 = 0
    BEGIN
        PRINT '  Created ' + CAST(@Counter AS VARCHAR(10)) + ' customers...';
    END
END

PRINT 'Completed: ' + CAST(@CustomerCount AS VARCHAR(10)) + ' customers created.';
PRINT '';

-- ===========================================
-- CREATE ADDITIONAL EMPLOYEES
-- ===========================================
PRINT 'Generating ' + CAST(@EmployeeCount AS VARCHAR(10)) + ' additional employees...';

SET @Counter = 0;
WHILE @Counter < @EmployeeCount
BEGIN
    DECLARE @EmployeeId INT = @StartEmployeeId + @Counter;
    DECLARE @EmpFirstName VARCHAR(20);
    DECLARE @EmpLastName VARCHAR(20);
    DECLARE @Title VARCHAR(30);
    DECLARE @EmpEmail VARCHAR(60);
    
    SET @EmpFirstName = CASE (@Counter % 15)
        WHEN 0 THEN 'Alex' WHEN 1 THEN 'Taylor' WHEN 2 THEN 'Jordan' WHEN 3 THEN 'Casey'
        WHEN 4 THEN 'Morgan' WHEN 5 THEN 'Riley' WHEN 6 THEN 'Cameron' WHEN 7 THEN 'Avery'
        WHEN 8 THEN 'Quinn' WHEN 9 THEN 'Blake' WHEN 10 THEN 'Sage' WHEN 11 THEN 'River'
        WHEN 12 THEN 'Dakota' WHEN 13 THEN 'Skyler' ELSE 'Phoenix'
    END;
    
    SET @EmpLastName = CASE (@Counter % 12)
        WHEN 0 THEN 'Clarke' WHEN 1 THEN 'Brooks' WHEN 2 THEN 'Reed' WHEN 3 THEN 'Bailey'
        WHEN 4 THEN 'Cooper' WHEN 5 THEN 'Morgan' WHEN 6 THEN 'Parker' WHEN 7 THEN 'Kelly'
        WHEN 8 THEN 'Rivera' WHEN 9 THEN 'Stewart' WHEN 10 THEN 'Turner' ELSE 'Collins'
    END;
    
    SET @Title = CASE (@Counter % 8)
        WHEN 0 THEN 'Sales Representative' WHEN 1 THEN 'Account Manager' WHEN 2 THEN 'Customer Success Manager'
        WHEN 3 THEN 'Business Development Rep' WHEN 4 THEN 'Sales Associate' WHEN 5 THEN 'Regional Manager'
        WHEN 6 THEN 'Territory Manager' ELSE 'Sales Specialist'
    END;
    
    SET @EmpEmail = LOWER(@EmpFirstName + '.' + @EmpLastName + '@company.com');
    
    INSERT INTO Employee (EmployeeId, LastName, FirstName, Title, ReportsTo, BirthDate, HireDate, Address, City, State, Country, PostalCode, Phone, Fax, Email)
    VALUES (
        @EmployeeId,
        @EmpLastName,
        @EmpFirstName,
        @Title,
        CASE WHEN @Counter % 4 = 0 THEN 1 ELSE NULL END,  -- Some report to employee 1
        DATEADD(YEAR, -25 - (@Counter % 15), GETDATE()),  -- Age between 25-40
        DATEADD(YEAR, -1 - (@Counter % 5), GETDATE()),    -- Hired within last 5 years
        CAST((500 + (@Counter % 499)) AS VARCHAR(4)) + ' Business Ave',
        'Seattle',
        'WA',
        'USA',
        '98101',
        '+1 (206) ' + CAST((200 + (@Counter % 799)) AS VARCHAR(3)) + '-' + CAST((1000 + (@Counter % 8999)) AS VARCHAR(4)),
        '+1 (206) ' + CAST((200 + (@Counter % 799)) AS VARCHAR(3)) + '-' + CAST((1000 + (@Counter % 8999)) AS VARCHAR(4)),
        @EmpEmail
    );
    
    SET @Counter = @Counter + 1;
END

PRINT 'Completed: ' + CAST(@EmployeeCount AS VARCHAR(10)) + ' employees created.';
PRINT '';

-- ===========================================
-- CREATE ADDITIONAL INVOICES
-- ===========================================
DECLARE @TotalInvoices INT = @CustomerCount * @InvoiceMultiplier;
PRINT 'Generating ' + CAST(@TotalInvoices AS VARCHAR(10)) + ' additional invoices...';

-- Get the range of newly created customer IDs
DECLARE @NewCustomerStartId INT, @NewCustomerEndId INT;
SELECT @NewCustomerEndId = MAX(CustomerId) FROM Customer;
SET @NewCustomerStartId = @NewCustomerEndId - @CustomerCount + 1;

PRINT 'Using customers from ID ' + CAST(@NewCustomerStartId AS VARCHAR(10)) + ' to ' + CAST(@NewCustomerEndId AS VARCHAR(10));

SET @Counter = 0;
WHILE @Counter < @TotalInvoices
BEGIN
    -- Use the newly created customer IDs in rotation
    DECLARE @InvoiceCustomerId INT = @NewCustomerStartId + (@Counter % @CustomerCount);
    DECLARE @InvoiceDate DATETIME = DATEADD(DAY, -(@Counter % 365), GETDATE());  -- Spread over last year
    DECLARE @InvoiceTotal DECIMAL(10,2) = (10.00 + (@Counter % 500)) + ((@Counter % 100) * 0.01);  -- Random total between $10-$515
    
    -- Insert invoice without specifying InvoiceId (let identity column auto-generate)
    INSERT INTO Invoice (CustomerId, InvoiceDate, BillingAddress, BillingCity, BillingState, BillingCountry, BillingPostalCode, Total)
    SELECT 
        @InvoiceCustomerId,
        @InvoiceDate,
        c.Address,
        c.City,
        c.State,
        c.Country,
        c.PostalCode,
        @InvoiceTotal
    FROM Customer c 
    WHERE c.CustomerId = @InvoiceCustomerId;
    
    -- Get the auto-generated InvoiceId
    DECLARE @NewInvoiceId INT = SCOPE_IDENTITY();
    
    -- Only create invoice lines if we successfully got an InvoiceId
    IF @NewInvoiceId IS NOT NULL
    BEGIN
        -- Add 2-5 invoice lines per invoice
        DECLARE @LineCount INT = 2 + (@Counter % 4);
        DECLARE @LineCounter INT = 0;
        
        WHILE @LineCounter < @LineCount
        BEGIN
            DECLARE @TrackId INT = 1 + (@Counter + @LineCounter) % (SELECT COUNT(*) FROM Track);
            DECLARE @UnitPrice DECIMAL(10,2) = 0.99 + ((@Counter + @LineCounter) % 2) * 0.70;  -- $0.99 or $1.69
            DECLARE @Quantity INT = 1 + ((@Counter + @LineCounter) % 3);  -- 1-3 items
            
            -- Insert invoice line without specifying InvoiceLineId (let identity column auto-generate)
            INSERT INTO InvoiceLine (InvoiceId, TrackId, UnitPrice, Quantity)
            VALUES (@NewInvoiceId, @TrackId, @UnitPrice, @Quantity);
            
            SET @LineCounter = @LineCounter + 1;
        END
    END
    
    SET @Counter = @Counter + 1;
    
    -- Progress indicator every 250 invoices
    IF @Counter % 250 = 0
    BEGIN
        PRINT '  Created ' + CAST(@Counter AS VARCHAR(10)) + ' invoices...';
    END
END

PRINT 'Completed: ' + CAST(@TotalInvoices AS VARCHAR(10)) + ' invoices created.';
PRINT '';

-- ===========================================
-- SUMMARY
-- ===========================================
PRINT 'Data generation completed successfully!';
PRINT '';
PRINT 'SUMMARY:';
PRINT '========';
SELECT 'Customers' as TableName, COUNT(*) as TotalRows FROM Customer
UNION ALL
SELECT 'Employees' as TableName, COUNT(*) as TotalRows FROM Employee  
UNION ALL
SELECT 'Invoices' as TableName, COUNT(*) as TotalRows FROM Invoice
UNION ALL
SELECT 'InvoiceLines' as TableName, COUNT(*) as TotalRows FROM InvoiceLine
ORDER BY TableName;

PRINT '';
PRINT 'Your database now has substantially more data for testing and demonstration!';
PRINT 'This larger dataset will provide more realistic performance scenarios.';