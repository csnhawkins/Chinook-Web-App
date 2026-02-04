-- =============================================
-- Chinook Music Store - Oracle Offers Table
-- =============================================
-- Creates an Offers table for demonstrating Flyway migrations
-- and the dynamic Offers tab functionality
-- =============================================

-- Drop table if it exists (for testing purposes)
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE OFFERS';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

-- Drop sequence if it exists
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE OFFERS_SEQ';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

-- Create sequence for primary key
CREATE SEQUENCE OFFERS_SEQ
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;
/

-- Create Offers table with sample structure
CREATE TABLE OFFERS (
    OFFERID NUMBER,
    OFFERNAME VARCHAR2(255) NOT NULL,
    DESCRIPTION VARCHAR2(500),
    DISCOUNTPERCENT NUMBER(5,2),
    STARTDATE DATE,
    ENDDATE DATE,
    ISACTIVE NUMBER(1) DEFAULT 1,
    CATEGORY VARCHAR2(100),
    MINIMUMPURCHASE NUMBER(10,2),
    MAXUSES NUMBER,
    TIMESUSED NUMBER DEFAULT 0,
    CREATEDDATE DATE DEFAULT SYSDATE,
    CREATEDBY VARCHAR2(100) DEFAULT 'System',
    CONSTRAINT PK_OFFERS PRIMARY KEY (OFFERID)
);
/

-- Create trigger for auto-incrementing primary key
CREATE OR REPLACE TRIGGER OFFERS_TRG
    BEFORE INSERT ON OFFERS
    FOR EACH ROW
BEGIN
    :NEW.OFFERID := OFFERS_SEQ.NEXTVAL;
END;
/

-- Insert sample data
INSERT INTO OFFERS (OFFERNAME, DESCRIPTION, DISCOUNTPERCENT, STARTDATE, ENDDATE, ISACTIVE, CATEGORY, MINIMUMPURCHASE, MAXUSES, TIMESUSED)
VALUES ('Rock Music Sale', 'Special discount on all rock albums', 15.00, DATE '2025-01-01', DATE '2025-12-31', 1, 'Music', 10.00, 1000, 45);

INSERT INTO OFFERS (OFFERNAME, DESCRIPTION, DISCOUNTPERCENT, STARTDATE, ENDDATE, ISACTIVE, CATEGORY, MINIMUMPURCHASE, MAXUSES, TIMESUSED)
VALUES ('Jazz Collection Offer', 'Buy 2 jazz albums, get 20% off', 20.00, DATE '2025-02-01', DATE '2025-11-30', 1, 'Music', 25.00, 500, 12);

INSERT INTO OFFERS (OFFERNAME, DESCRIPTION, DISCOUNTPERCENT, STARTDATE, ENDDATE, ISACTIVE, CATEGORY, MINIMUMPURCHASE, MAXUSES, TIMESUSED)
VALUES ('Classical Premium', 'Premium classical music discount for members', 25.00, DATE '2025-01-15', DATE '2025-06-15', 1, 'Classical', 50.00, 200, 8);

INSERT INTO OFFERS (OFFERNAME, DESCRIPTION, DISCOUNTPERCENT, STARTDATE, ENDDATE, ISACTIVE, CATEGORY, MINIMUMPURCHASE, MAXUSES, TIMESUSED)
VALUES ('New Customer Welcome', 'Welcome offer for first-time customers', 10.00, DATE '2025-01-01', DATE '2025-12-31', 1, 'Welcome', 0.00, NULL, 156);

INSERT INTO OFFERS (OFFERNAME, DESCRIPTION, DISCOUNTPERCENT, STARTDATE, ENDDATE, ISACTIVE, CATEGORY, MINIMUMPURCHASE, MAXUSES, TIMESUSED)
VALUES ('Summer Festival Deal', 'Festival season special pricing', 30.00, DATE '2025-06-01', DATE '2025-08-31', 0, 'Seasonal', 75.00, 100, 0);

INSERT INTO OFFERS (OFFERNAME, DESCRIPTION, DISCOUNTPERCENT, STARTDATE, ENDDATE, ISACTIVE, CATEGORY, MINIMUMPURCHASE, MAXUSES, TIMESUSED)
VALUES ('Metal Madness', 'Exclusive metal album collection discount', 18.00, DATE '2025-03-01', DATE '2025-09-30', 1, 'Metal', 15.00, 300, 67);

INSERT INTO OFFERS (OFFERNAME, DESCRIPTION, DISCOUNTPERCENT, STARTDATE, ENDDATE, ISACTIVE, CATEGORY, MINIMUMPURCHASE, MAXUSES, TIMESUSED)
VALUES ('Oracle Exclusive', 'Special Oracle database music collection', 22.00, DATE '2025-01-01', DATE '2025-12-31', 1, 'Technology', 40.00, 250, 34);

-- Commit the data
COMMIT;
/

-- Create indexes for better performance
CREATE INDEX IDX_OFFERS_ACTIVE_CAT ON OFFERS (ISACTIVE, CATEGORY);
CREATE INDEX IDX_OFFERS_DATES ON OFFERS (STARTDATE, ENDDATE);
/

-- Display the created data
SELECT * FROM OFFERS ORDER BY OFFERID;
/

-- Show table structure
DESCRIBE OFFERS;
/

-- Display summary
SELECT 'Oracle Offers table created successfully with ' || COUNT(*) || ' sample records.' AS RESULT
FROM OFFERS;
/

SELECT 'Use this table to test the dynamic Offers functionality in the Chinook WebApp.' AS NOTE FROM DUAL;
/