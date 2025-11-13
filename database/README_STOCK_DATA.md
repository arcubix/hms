# Pharmacy Stock Sample Data

## How to Add Stock Data to Database

This script adds sample stock data so medicines appear in the POS system.

### Steps to Run:

1. **Make sure the database schema is created:**
   ```sql
   -- Run this first if you haven't already
   SOURCE database/pharmacy_pos_schema.sql;
   ```

2. **Run the stock sample data script:**
   ```sql
   SOURCE database/pharmacy_stock_sample_data.sql;
   ```

   Or via command line:
   ```bash
   mysql -u root -p hms < database/pharmacy_stock_sample_data.sql
   ```

3. **Verify the data was inserted:**
   ```sql
   -- Check stock entries
   SELECT COUNT(*) as total_stock_entries FROM medicine_stock WHERE status = 'Active';
   
   -- Check medicines with stock
   SELECT m.name, m.generic_name, SUM(ms.quantity - ms.reserved_quantity) as available_stock
   FROM medicines m
   JOIN medicine_stock ms ON m.id = ms.medicine_id
   WHERE ms.status = 'Active'
   GROUP BY m.id, m.name, m.generic_name
   ORDER BY m.name;
   ```

### What the Script Does:

1. **Creates 3 sample suppliers** (if they don't exist)
2. **Adds stock for common medicines:**
   - Panadol (Paracetamol)
   - Brufen (Ibuprofen)
   - Diclofenac
   - Augmentin
   - Azithromycin
   - Ciprofloxacin
   - Amoxicillin
   - Omeprazole

3. **Adds stock for ALL active medicines** that don't have stock yet (up to 50 medicines)
   - Each gets 100 units
   - Cost price: PKR 5.00
   - Selling price: PKR 10.00
   - Expiry date: 1 year from now

4. **Creates reorder levels** for all medicines with stock

### Notes:

- The script uses `SELECT` subqueries to find medicine IDs by name, so it works with any medicine IDs
- If a medicine doesn't exist, that stock entry will be skipped (no error)
- Stock entries have realistic batch numbers, expiry dates, and locations
- All stock is set to 'Active' status

### Troubleshooting:

If medicines still don't appear:
1. Check that medicines exist: `SELECT * FROM medicines WHERE status = 'Active' LIMIT 10;`
2. Check that stock exists: `SELECT * FROM medicine_stock WHERE status = 'Active' LIMIT 10;`
3. Verify the API endpoint is working: Check browser console for errors
4. Clear browser cache and refresh

