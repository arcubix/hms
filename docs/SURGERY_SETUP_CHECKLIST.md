# Surgery Management Setup Checklist

## Quick Fixes Applied

### ✅ Frontend Fixes
1. **Fixed SelectItem Empty String Error**
   - Removed empty string values from SelectItem components
   - Changed to use `undefined` for empty state
   - Fixed in: `frontend/src/components/modules/OTSchedules.tsx`
   - Lines: 682, 715, 732

2. **Fixed Scissors Import**
   - Added `Scissors` to imports in `IPDManagement.tsx`
   - If error persists, clear browser cache and restart dev server

## Database Setup Required

### ⚠️ CRITICAL: Run Migration Script

The 500 errors are because these database tables don't exist yet. 

**QUICK FIX: Run this single migration script:**

```sql
-- File: database/migrate_surgery_management_tables.sql
-- This creates ALL required tables in one go:
--   1. operation_theatres
--   2. ipd_ot_schedules  
--   3. ipd_pre_op_checklist
--   4. ipd_surgery_charges
--   5. ipd_surgery_consumables
```

**OR run individual scripts in order:**

1. **Operation Theatres Table**
   ```sql
   -- File: database/operation_theatres_schema.sql
   ```

2. **OT Schedules Table** (if not in ipd_reports_schema.sql)
   ```sql
   -- File: database/ipd_reports_schema.sql (lines 184-227)
   ```

3. **Surgery Billing Tables**
   ```sql
   -- File: database/ipd_surgery_billing_schema.sql
   ```

4. **Pre-Op Checklist Table**
   ```sql
   -- File: database/ipd_pre_op_checklist_schema.sql
   ```

### How to Run SQL Scripts

**Option 1: Using phpMyAdmin**
1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Select your database
3. Go to "SQL" tab
4. Copy and paste the contents of each SQL file
5. Click "Go"

**Option 2: Using MySQL Command Line**
```bash
mysql -u root -p your_database_name < database/operation_theatres_schema.sql
mysql -u root -p your_database_name < database/ipd_surgery_billing_schema.sql
mysql -u root -p your_database_name < database/ipd_pre_op_checklist_schema.sql
```

**Option 3: Using XAMPP MySQL (RECOMMENDED)**
1. Open XAMPP Control Panel
2. Start MySQL
3. Open phpMyAdmin (http://localhost/phpmyadmin)
4. Select your database (`hms_db`)
5. Click "SQL" tab
6. Copy entire contents of `database/migrate_surgery_management_tables.sql`
7. Paste and click "Go"
8. Verify success message

**Option 4: Direct SQL File Import**
1. Open phpMyAdmin
2. Select database
3. Click "Import" tab
4. Choose file: `database/migrate_surgery_management_tables.sql`
5. Click "Go"

## Verification Steps

After running SQL scripts, verify:

1. **Check Tables Exist**
   ```sql
   SHOW TABLES LIKE 'operation_theatres';
   SHOW TABLES LIKE 'ipd_surgery_charges';
   SHOW TABLES LIKE 'ipd_surgery_consumables';
   SHOW TABLES LIKE 'ipd_pre_op_checklist';
   ```

2. **Check OT Data**
   ```sql
   SELECT * FROM operation_theatres;
   ```
   Should show 6 OTs (OT 1 through OT 6)

3. **Test API Endpoints**
   - Open browser console
   - Navigate to OT Schedules page
   - Check Network tab for API calls
   - Should see 200 status instead of 500

## Common Issues & Solutions

### Issue 1: 500 Error on `/api/ipd/ot-schedules`
**Cause**: `ipd_ot_schedules` table might not exist or has wrong structure
**Solution**: 
- Check if table exists: `SHOW TABLES LIKE 'ipd_ot_schedules';`
- Verify table structure matches `database/ipd_reports_schema.sql`

### Issue 2: 500 Error on `/api/ipd/operation-theatres`
**Cause**: `operation_theatres` table doesn't exist
**Solution**: Run `database/operation_theatres_schema.sql`

### Issue 3: Scissors Error Persists
**Cause**: Browser cache or dev server cache
**Solution**:
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Restart dev server
3. Clear browser cache
4. Check `IPDManagement.tsx` line 120 has `Scissors` in imports

### Issue 4: SelectItem Error Persists
**Cause**: Component not reloaded
**Solution**:
1. Save `OTSchedules.tsx` file
2. Hard refresh browser
3. Check browser console for exact line number

## Testing Checklist

After setup, test these workflows:

- [ ] Can view OT Schedules page
- [ ] Can see list of Operation Theatres
- [ ] Can create new OT schedule
- [ ] Can check OT availability
- [ ] Can start surgery
- [ ] Can complete surgery
- [ ] Can access pre-op checklist
- [ ] Can complete pre-op checklist
- [ ] Can access surgery billing
- [ ] Can add consumables
- [ ] Can calculate charges
- [ ] Can save charges

## Next Steps

1. **Run Database Migrations** (CRITICAL)
2. **Clear Browser Cache**
3. **Restart Dev Server** (if needed)
4. **Test Each Workflow**
5. **Report Any Remaining Issues**

---

**Note**: The 500 errors will persist until database tables are created. This is expected behavior.

