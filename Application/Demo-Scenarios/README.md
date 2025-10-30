# Performance Demo Setup

This folder contains a simple but effective demonstration of SQL Server performance optimization for your "Securing Data in Non-Prod" presentation.

## The Demo Story

**Scenario**: A junior developer created a stored procedure for generating invoice reports. While well-intentioned and thoroughly commented, the procedure contains several performance issues that are common in development environments when production data is copied without proper optimization.

## Files in This Demo

### Core Demo Files:
- **`01_Create_Slow_StoredProcedure.sql`** - Creates the "junior developer" version with performance issues
- **`02_Fix_StoredProcedure.sql`** - Optimizes the same procedure during your live demo
- **`03_Generate_Monitoring_Data.sql`** - Optional: Adds monitoring data if using Redgate Monitor

## Demo Flow (5-8 minutes)

### 1. Pre-Demo Setup (2 minutes)
```sql
-- Run this before your presentation:
01_Create_Slow_StoredProcedure.sql
```

### 2. Live Demo (5 minutes)

**Step 1: Show the Problem**
- Enable Demo Mode in the webapp (Admin Settings → Demo Mode: ON)
- Navigate to Reports → Select any invoice
- **Expected**: 2+ second response time with red performance warning
- **Demo Script**: *"Our users are complaining about slow reports. Let me check what's happening..."*

**Step 2: Investigate the Code**
- Show `01_Create_Slow_StoredProcedure.sql` in SSMS
- **Demo Script**: *"This procedure was written by a junior developer. The comments look thorough, but let me examine the actual code..."*
- **Point out issues**:
  - CROSS JOINs instead of proper JOINs
  - Multiple unnecessary subqueries
  - 2-second artificial delay "for data consistency"
  - Unnecessary DISTINCT and complex sorting

**Step 3: Fix Live**
- Run `02_Fix_StoredProcedure.sql` 
- **Demo Script**: *"Let me optimize this procedure with proper JOINs and remove the unnecessary complexity..."*

**Step 4: Show Results**
- Refresh the Reports page in the webapp
- **Expected**: <500ms response time with green indicator
- **Demo Script**: *"Now the same procedure runs in under 500ms - that's a 4x improvement!"*

## Key Demo Benefits

✅ **Realistic Scenario** - Actual stored procedure optimization, not artificial examples
✅ **Live Demonstration** - Fix the same procedure name during presentation
✅ **Immediate Results** - Performance improvement visible instantly
✅ **Professional Context** - Addresses real development practices and code review

## Technical Details

### Performance Issues Demonstrated:
- **CROSS JOINs**: Creates Cartesian products then filters with WHERE
- **Subquery Overuse**: Multiple correlated subqueries in SELECT clause
- **Artificial Delays**: WAITFOR statements masquerading as "safety"
- **Unnecessary DISTINCT**: Used without understanding impact
- **Complex Sorting**: ORDER BY with expensive calculations

### Performance Fixes Applied:
- **Proper JOINs**: INNER JOIN with appropriate ON conditions
- **Simplified SELECT**: Only necessary columns returned
- **Removed Delays**: No artificial waiting
- **Streamlined Logic**: Direct, efficient query path

## Optional Monitoring Integration

If using Redgate Monitor:
1. Run `03_Generate_Monitoring_Data.sql` before demo
2. Monitor will detect the performance issues automatically
3. Show monitoring alerts during the "problem" phase
4. Show improved metrics after the fix

## Prerequisites

- SQL Server with Chinook database
- Simple-music-app running and connected
- Demo Mode capability in webapp
- Access to execute SQL scripts

---

*This demo effectively showcases how TDM practices should include performance considerations when copying data between environments.*

### Demo Flow

#### 1. Pre-Demo Setup (5 minutes before your session)
```bash
# Run the performance issue creation script
01_Create_Performance_Issue.sql
```

This script removes critical indexes to simulate a realistic performance crisis:
- Removes `Customer.Email` index (slow email searches)
- Removes `Customer.FirstName + LastName` index (slow name searches)  
- Removes `Invoice.CustomerId` index (slow joins)

#### 2. During Your Presentation

**Phase 1: Demonstrate the Problem**
1. Open the Simple-music-app in your browser
2. **Navigate to the "Reports" tab** (⭐ STAR OF THE SHOW)
3. Try invoice reports: **#1, #5, #10** (good test cases)
4. **Point out the performance indicators**:
   - Red/orange query times (2000-5000ms+)
   - Performance warning alerts
   - Both server time AND total time displayed
   - Realistic business impact on user experience

**Phase 2: Show TDM Best Practices**
1. Explain the problem: *"This report joins 4 tables - Invoice, Customer, InvoiceLine, Track"*
2. Highlight sensitive data: *"Customer emails, purchase history, financial data"*
3. Connect to TDM: *"When we copy prod data, we often forget about indexes"*
4. Explain how TDM tools help:
   - Subset data to reduce volume
   - Anonymize sensitive data (customer emails, names)
   - Maintain referential integrity
   - **Preserve performance characteristics**

**Phase 3: Demonstrate the Resolution**
```bash
# Run the fix script
02_Fix_Performance_Issue.sql
```

1. Re-run the same Reports (invoice #1, #5, #10)
2. **Highlight the dramatic improvement**:
   - Green query times (<500ms)  
   - No performance warnings
   - Much better user experience
   - Same business functionality, massively better performance

## Key Demo Points

### Visual Performance Indicators
The webapp now shows:
- 🟢 **Fast queries** (<500ms): Green indicators
- 🟡 **Moderate queries** (500-2000ms): Yellow indicators  
- 🟠 **Slow queries** (2000-5000ms): Orange warnings
- 🔴 **Critical queries** (>5000ms): Red alerts with animation

### Enhanced Reports Tab
- **Performance Summary**: Shows both server query time and total response time
- **Loading States**: Professional loading indicators during query execution
- **Automatic Alerts**: Pop-up warnings for slow reports (>3000ms)
- **Multi-table Context**: Demonstrates realistic business report complexity
- **Sensitive Data**: Shows customer PII that needs TDM protection

### Automatic Alerts
- Performance alerts appear automatically for queries >3000ms
- Alerts highlight potential indexing or data volume issues
- Real-time feedback helps developers spot problems immediately

### Environment Awareness
- Production environments: Blue theme (be careful!)
- Non-production environments: Purple theme (safe to experiment)
- Visual cues prevent accidental production changes

## Demo Script Talking Points

### The Problem (Reports Tab Demo)
*"Here's a typical business report - invoice details with customer information and purchased tracks. This is exactly the kind of functionality that breaks in non-prod environments when we don't consider performance."*

*"Watch this - I'll load invoice #5... [wait for slow response] ...5 seconds! And look at these red warning indicators. In a real business scenario, users would be frustrated and developers might not even notice the problem until it hits production."*

*"This query is joining 4 tables: Invoice, Customer, InvoiceLine, and Track. It's also exposing sensitive customer data - emails, names, purchase history. This is exactly what TDM should protect AND optimize."*

### The TDM Solution  
*"With proper Test Data Management, we can:*
- *Subset data to manageable sizes while preserving relationships between invoices, customers, and tracks*
- *Anonymize sensitive customer information - emails, names, addresses*  
- *Maintain realistic performance characteristics with proper indexing*
- *Give developers immediate visual feedback when something's wrong - see those red performance warnings?"*

*"The key insight: TDM isn't just about security compliance. It's about creating realistic test environments that behave like production."*

### The Resolution Demo
*"Now let me restore the missing indexes... [run the fix script] ...and try the same report again."*

*"Look at that! Same invoice #5 - now under 500ms with green performance indicators. Same business functionality, same data relationships, but dramatically better performance because we've restored the proper database structure."*

*"This is why modern TDM processes need to consider the complete environment - not just data volume and privacy, but also performance characteristics that developers depend on."*

## Troubleshooting

### If queries are still slow after running the fix script:
1. Check that indexes were actually created:
   ```sql
   SELECT name, type_desc FROM sys.indexes WHERE object_id = OBJECT_ID('Customer')
   ```

2. Update table statistics:
   ```sql
   UPDATE STATISTICS Customer
   UPDATE STATISTICS Invoice  
   ```

### If performance indicators aren't showing:
1. Ensure the webapp is using the latest code
2. Refresh the browser page
3. Check browser console for JavaScript errors

## Database Compatibility

The demo scripts are designed for:
- ✅ **SQL Server** (primary focus)

For the complete monitoring + TDM demo experience, use:
- **01_Create_Real_Performance_Issues.sql** (creates authentic monitoring alerts)
- **03_Generate_Monitoring_Data.sql** (generates data for Redgate Monitor)
- **02_Fix_Performance_Issues_Live.sql** (live demo fix script)

## Demo Duration
- **Setup**: 5 minutes (before session)
- **Problem demonstration**: 3-4 minutes
- **TDM explanation**: 5-7 minutes  
- **Resolution demonstration**: 2-3 minutes
- **Total demo time**: 10-15 minutes

This creates a compelling narrative about why proper Test Data Management matters for both security AND performance!