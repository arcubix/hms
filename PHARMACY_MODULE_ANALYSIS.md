# Pharmacy Module Analysis Report

## Overview
This document identifies all pages in the pharmacy module that contain mock data and buttons that are not functional.

---

## 1. PAGES WITH MOCK DATA

### 1.1 AddSupplier.tsx
**File:** `frontend/src/components/pharmacy/AddSupplier.tsx`

#### Mock Data Locations:

1. **Brands Array** (Lines 128-142)
   - Hardcoded brand: "PharmaCorp International"
   - Contains mock discounts and promotions
   - **Issue:** Should load from API or start empty

2. **Medicine Targets Array** (Lines 147-150)
   - Hardcoded targets:
     - Paracetamol 500mg (target: 5000, progress: 3200)
     - Amoxicillin 250mg (target: 3000, progress: 1800)
   - **Issue:** Should load from API or start empty

3. **Doctor Relations Array** (Lines 154-157)
   - Hardcoded doctors:
     - Dr. Sarah Ahmed (General Physician)
     - Dr. Ali Khan (Cardiologist)
   - **Issue:** Should load from API or start empty

4. **Commission Summary Cards** (Lines 770-812)
   - Hardcoded values:
     - Total Earned (MTD): PKR 125,450 (Line 779)
     - Avg Commission: 7.5% (Line 793)
     - Total Orders: 248 (Line 807)
   - **Issue:** Should calculate from actual supplier data via API

5. **Sample Documents List** (Lines 942-946)
   - Hardcoded document list:
     - Supply Agreement 2025.pdf
     - Business License.pdf
     - GST Certificate.pdf
   - **Issue:** Should load from API or start empty

---

### 1.2 POSScreen.tsx
**File:** `frontend/src/components/pharmacy/POSScreen.tsx`

#### Mock Data Locations:

1. **mockMedicines Array** (Lines 51+)
   - Large array of hardcoded medicines with:
     - IDs, names, categories
     - Stock quantities
     - Batch numbers
     - Expiry dates
     - Prices
     - Barcodes
   - **Issue:** Should use API to load medicines from database
   - **Note:** This appears to be an older/alternative POS component

---

### 1.3 SalesReports.tsx
**File:** `frontend/src/components/pharmacy/SalesReports.tsx`

#### Mock Data Locations:

1. **salesData Array** (Lines 22-30)
   - Weekly sales data with hardcoded values
   - Contains: day, sales, transactions, customers

2. **topSellingMedicines Array** (Lines 32-38)
   - Top 5 selling medicines with hardcoded quantities and revenue

3. **categoryWiseSales Array** (Lines 40-46)
   - Category-wise sales percentages

4. **recentTransactions Array** (Lines 48-85)
   - Recent transaction history with hardcoded data

   - **Issue:** All data should come from API calls
   - **Note:** Component appears to be using mock data exclusively

---

### 1.4 PharmacyManagement.tsx (Dashboard)
**File:** `frontend/src/components/modules/PharmacyManagement.tsx`

#### Mock Data Locations:

1. **Dashboard Fallback Data** (Lines 455-462)
   - Empty chart data fallback when API data is unavailable
   - **Status:** ACCEPTABLE - This is a proper fallback pattern, not mock data
   - Uses empty arrays when API fails, which is correct behavior

---

## 2. NON-FUNCTIONAL BUTTONS

### 2.1 AddSupplier.tsx
**File:** `frontend/src/components/pharmacy/AddSupplier.tsx`

#### Non-Functional Buttons:

1. **"Save Supplier" Button** (Lines 234, 985)
   - **Location:** Header and bottom action bar
   - **Handler:** `handleSaveSupplier()` (Line 168)
   - **Issue:** Only shows toast notification, no API call
   - **Current Code:**
     ```typescript
     const handleSaveSupplier = () => {
       if (!supplierName || !contactPerson || !phone) {
         toast.error('Please fill in all required fields');
         return;
       }
       toast.success('Supplier saved successfully!', {
         description: `${supplierName} has been added to the system`
       });
       // Reset form or navigate
     };
     ```
   - **Expected:** Should call `api.createSupplier()` with form data
   - **API Available:** `api.createSupplier()` exists in `frontend/src/services/api.ts` (Line 1967)

2. **"Cancel" Buttons** (Lines 230, 981)
   - **Location:** Header and bottom action bar
   - **Issue:** No onClick handler - buttons don't navigate or close
   - **Expected:** Should navigate back or close dialog

3. **"Add Tier" Button** (Line 729)
   - **Location:** Commission Structure tab
   - **Issue:** No onClick handler
   - **Current Code:**
     ```typescript
     <Button variant="outline" size="sm">
       <Plus className="w-4 h-4 mr-2" />
       Add Tier
     </Button>
     ```
   - **Expected:** Should open dialog or add tier to `tieredCommission` state

4. **Edit Tier Button** (Line 757)
   - **Location:** Commission Structure tab, tiered commission table
   - **Issue:** No onClick handler
   - **Current Code:**
     ```typescript
     <Button variant="ghost" size="sm">
       <Edit className="w-4 h-4" />
     </Button>
     ```
   - **Expected:** Should open edit dialog for tier

5. **Document Upload Area** (Line 932)
   - **Location:** Documents tab
   - **Issue:** UI only, no actual file upload functionality
   - **Current Code:** Just a div with hover effect, no file input or upload handler
   - **Expected:** Should have file input and upload handler

6. **Delete Document Button** (Line 959)
   - **Location:** Documents tab, sample documents list
   - **Issue:** No onClick handler
   - **Current Code:**
     ```typescript
     <Button variant="ghost" size="sm">
       <Trash2 className="w-4 h-4 text-red-600" />
     </Button>
     ```
   - **Expected:** Should call API to delete document

---

### 2.2 Other Components

#### PurchaseOrders.tsx
- **Status:** All buttons appear functional with proper API calls

#### SalesHistory.tsx
- **Status:** All buttons appear functional with proper API calls

#### StockManagement.tsx
- **Status:** All buttons appear functional with proper API calls

#### RefundProcessing.tsx
- **Status:** All buttons appear functional with proper API calls

#### StockAdjustments.tsx
- **Status:** All buttons appear functional with proper API calls

#### BarcodeManagement.tsx
- **Status:** All buttons appear functional with proper API calls

#### StockMovements.tsx
- **Status:** All buttons appear functional with proper API calls

#### POSSettings.tsx
- **Status:** All buttons appear functional with proper API calls

#### GSTRatesManagement.tsx
- **Status:** All buttons appear functional with proper API calls

#### AdvancedPOS.tsx
- **Status:** All buttons appear functional with proper API calls

---

## 3. SUMMARY

### Mock Data Summary:
- **3 components** contain mock/hardcoded data:
  1. `AddSupplier.tsx` - Multiple mock arrays and hardcoded values
  2. `POSScreen.tsx` - Large mock medicines array
  3. `SalesReports.tsx` - Multiple mock data arrays

### Non-Functional Buttons Summary:
- **1 component** has non-functional buttons:
  1. `AddSupplier.tsx` - 6 non-functional buttons/features:
     - Save Supplier (no API call)
     - Cancel buttons (no navigation)
     - Add Tier (no handler)
     - Edit Tier (no handler)
     - Document Upload (UI only)
     - Delete Document (no handler)

---

## 4. RECOMMENDATIONS

### For Mock Data:

1. **AddSupplier.tsx:**
   - Remove hardcoded brands, targets, and doctor relations arrays
   - Initialize state as empty arrays: `useState<Brand[]>([])`
   - Load data from API on component mount (if editing existing supplier)
   - Replace hardcoded commission summary with API call or calculations

2. **POSScreen.tsx:**
   - Replace `mockMedicines` with API call to `api.getMedicines()`
   - Consider if this component is still in use (AdvancedPOS.tsx seems to be the main POS)

3. **SalesReports.tsx:**
   - Replace all mock data arrays with API calls
   - Use `api.getSalesSummary()`, `api.getSales()`, etc.

### For Non-Functional Buttons:

1. **AddSupplier.tsx - Save Supplier:**
   ```typescript
   const handleSaveSupplier = async () => {
     if (!supplierName || !contactPerson || !phone) {
       toast.error('Please fill in all required fields');
       return;
     }
     
     try {
       const supplierData = {
         name: supplierName,
         contact_person: contactPerson,
         phone: phone,
         email: email || undefined,
         address: address || undefined,
         tax_id: gstNumber || undefined,
         credit_limit: parseFloat(creditLimit) || 0,
         payment_terms: paymentTerms,
         // ... other fields
       };
       
       await api.createSupplier(supplierData);
       toast.success('Supplier saved successfully!');
       // Navigate back or reset form
     } catch (error: any) {
       toast.error(error.message || 'Failed to save supplier');
     }
   };
   ```

2. **AddSupplier.tsx - Cancel Buttons:**
   - Add navigation: `onClick={() => navigate(-1)}` or `onClick={() => router.back()}`
   - Or close dialog if in modal context

3. **AddSupplier.tsx - Add Tier:**
   ```typescript
   const handleAddTier = () => {
     setTieredCommission([...tieredCommission, { min: 0, max: 0, rate: 0 }]);
   };
   ```

4. **AddSupplier.tsx - Edit Tier:**
   - Add state for editing tier
   - Open dialog with tier data
   - Update tier in array on save

5. **AddSupplier.tsx - Document Upload:**
   - Add file input: `<Input type="file" onChange={handleFileUpload} />`
   - Implement upload handler calling API

6. **AddSupplier.tsx - Delete Document:**
   - Add handler: `onClick={() => handleDeleteDocument(doc.id)}`
   - Implement delete function calling API

---

## 5. API METHODS AVAILABLE

The following API methods are available in `frontend/src/services/api.ts`:

- ✅ `api.createSupplier()` - Line 1967
- ✅ `api.updateSupplier()` - Line 1979
- ✅ `api.getSupplier()` - Line 1959
- ❌ No API methods found for:
  - Brands management
  - Medicine targets management
  - Doctor relations management
  - Document upload/management

**Note:** These features may need backend API endpoints to be created first.

---

## 6. PRIORITY FIXES

### High Priority:
1. **AddSupplier.tsx - Save Supplier button** - Critical functionality
2. **AddSupplier.tsx - Remove mock data** - Data integrity issue

### Medium Priority:
3. **SalesReports.tsx - Replace mock data** - Reporting accuracy
4. **AddSupplier.tsx - Cancel buttons** - User experience

### Low Priority:
5. **AddSupplier.tsx - Tier management buttons** - Advanced feature
6. **AddSupplier.tsx - Document upload** - May need backend support
7. **POSScreen.tsx - Replace mock data** - If component is still in use

---

## End of Report

