# Large Dataset Generator for Chinook Database

This Python script generates realistic large-scale data for the Chinook database across all supported database platforms.

## Features

- **Realistic Data**: Uses real names from diverse cultures (200+ first names, 200+ last names)
- **Geographic Accuracy**: Accurate city/country/state combinations with proper postal codes
- **Real Artists**: 80 chart-topping artists with 160 albums and 439 tracks (clean content only)
- **Date Range**: Invoices from January 1, 2022 to January 19, 2026
- **Multi-Database Support**: Generates platform-specific SQL for:
  - SQL Server (MSSQL)
  - Oracle
  - PostgreSQL
  - MySQL
- **Optimized for Large Datasets**: Features batching (1000 rows per INSERT), transactions, and efficient memory usage
- **Scalable**: Successfully tested with 10,000+ customers and 100,000+ invoices

## Performance Optimizations

The script includes several optimizations for handling large datasets:

1. **Batched Inserts**: All databases use batched INSERT statements (1000 rows per batch for MSSQL/PostgreSQL/MySQL, 500 for Oracle)
2. **Transaction Boundaries**: All INSERTs wrapped in transactions for better performance
3. **Explicit ID Management**: Uses `IDENTITY_INSERT` (MSSQL) and explicit IDs for all databases to ensure proper foreign key relationships
4. **Memory Efficient**: Processes data incrementally to avoid memory issues with large datasets

## Usage

### Interactive Mode (Recommended)

Run the script without arguments to use interactive mode:

```bash
cd Database
py generate_large_dataset.py
```

You'll be prompted to select:
1. **Target database(s)** - Choose a specific database or generate for all
2. **Number of new customers** - Default: 941 (for a total of 1,000)
3. **Number of new invoices** - Default: 3,588 (for a total of 4,000)

### Command Line Mode

```bash
# Generate for all databases with default counts (941 customers, 3,588 invoices)
py generate_large_dataset.py all

# Generate for specific database
py generate_large_dataset.py mssql
py generate_large_dataset.py oracle
py generate_large_dataset.py postgresql
py generate_large_dataset.py mysql

# Specify custom counts: database, new_customers, new_invoices
py generate_large_dataset.py all 500 2000
py generate_large_dataset.py mssql 1000 5000
```

## Output Files

The script creates database-specific SQL files in their respective directories:

```
Database/
├── MSSQL/
│   └── large_dataset_inserts_mssql.sql
├── Oracle/
│   └── large_dataset_inserts_oracle.sql
├── PostgreSQL/
│   └── large_dataset_inserts_postgresql.sql
└── MySQL/
    └── large_dataset_inserts_mysql.sql
```

Each file contains INSERT statements compatible with that platform's syntax:
- **SQL Server**: `[dbo].[Table]`, `N'string'` literals
- **Oracle**: `INSERT ALL...SELECT FROM dual`, explicit IDs
- **PostgreSQL**: lowercase `table_name`, `TIMESTAMP` format
- **MySQL**: backtick identifiers `` `Table` ``, `AUTO_INCREMENT`

## Generated Data

### Customers (Default: 941 new, 1,000 total)
- 59 original customers in base database
- Diverse names from American, European, Latin American, Indian, Asian, Middle Eastern, and Slavic cultures
- Geographic accuracy: Real cities matched with appropriate countries and states
- Realistic postal codes, phone numbers with country-appropriate prefixes
- Email addresses with country-specific domains (.com, .co.uk, .de, .in, etc.)

### Invoices (Default: 3,588 new, 4,000 total)
- 412 original invoices in base database
- Date range: January 1, 2022 - January 19, 2026
- Random amounts between $0.99 and $50.00
- Customer addresses match customer data

### Artists & Music (80 artists, 160 albums, 439 tracks)
- Real chart-topping artists (Taylor Swift, Ed Sheeran, Coldplay, etc.)
- Two albums per artist with realistic track counts
- Clean content only (no explicit lyrics)
- Covers Pop, Rock, Hip-Hop, Country, and EDM genres

## Requirements

- Python 3.7 or higher
- No external dependencies (uses only standard library)

## Example Output

```
================================================================================
Chinook Database - Large Scale Data Generator
================================================================================

Select target database(s):
  1. SQL Server (MSSQL)
  2. Oracle
  3. PostgreSQL
  4. MySQL
  5. All databases

Enter choice (1-5): 5

How many new customers to generate?
  Current: 59 in base database
  Recommended: 941 (for total of 1,000)
Enter number of new customers (default 941): 

How many new invoices to generate?
  Current: 412 in base database
  Recommended: 3,588 (for total of 4,000)
  Date range: Jan 1, 2022 - Jan 19, 2026
Enter number of new invoices (default 3588): 

Generating 1,000 customers with diverse, realistic data...

✓ Generated 941 new customers
  Total customers: 1,000 (59 original + 941 new)

Generating 4,000 invoices for 2022-2026 (Jan 1, 2022 - Jan 19, 2026)...

✓ Generated 3,588 new invoices
  Total invoices: 4,000 (412 original + 3,588 new)

Generating 200 real artists from charts with clean content...

✓ Generated 80 artists
✓ Generated 160 albums
✓ Generated 439 tracks

Creating MSSQL format...
  ✓ MSSQL/large_dataset_inserts_mssql.sql
Creating ORACLE format...
  ✓ Oracle/large_dataset_inserts_oracle.sql
Creating POSTGRESQL format...
  ✓ PostgreSQL/large_dataset_inserts_postgresql.sql
Creating MYSQL format...
  ✓ MySQL/large_dataset_inserts_mysql.sql

================================================================================
Summary:
  - 80 real artists from Billboard/mainstream charts
  - 160 real albums with clean content
  - 439 real tracks (no explicit content)
  - 941 realistic customers from diverse cultures
  - Accurate city/country/state combinations
  - 3,588 invoices (Jan 1, 2022 - Jan 19, 2026)
  - Realistic invoice amounts ($0.99 - $50.00)
  - Generated for: MSSQL, ORACLE, POSTGRESQL, MYSQL
================================================================================
```

## Use Cases

1. **Performance Testing**: Test application performance with thousands of records
2. **Demo Scenarios**: Realistic data for demonstrations and training
3. **Migration Testing**: Test database migrations with substantial datasets
4. **Reporting**: Test report generation with meaningful data volumes
5. **Multi-Database Compatibility**: Verify application works across all supported databases
