# Pharmacy Management - Expense & Purchase Order Modules

## ✅ Modules Successfully Implemented

### **1. Expense Management**

#### **Access Path:**
```
Admin/Pharmacy Dashboard → Pharmacy → Expense
```

#### **Features:**

**Summary Cards (4 Cards):**
1. **Total Expenses** (Red gradient)
   - Icon: Dollar sign
   - Displays: Total of all expenses
   - Example: PKR 265,000
   - Trending up icon

2. **Today's Expenses** (Orange gradient)
   - Icon: Calendar
   - Badge: Count of today's expenses
   - Shows: Sum of expenses for current date
   - Filtered by date

3. **Paid Expenses** (Green gradient)
   - Icon: Check circle
   - Badge: Number of paid expenses
   - Shows: Count with paid status
   - Success indicator

4. **Pending Expenses** (Yellow gradient)
   - Icon: Clock
   - Badge: Number of pending expenses
   - Shows: Count with pending status
   - Attention required

**Expense History Table (8 columns):**
1. **Date**: Expense date
2. **Category**: Badge with category name
3. **Description**: Full description text
4. **Amount**: Bold red text with PKR
5. **Payment Method**: Bank Transfer, Cash, etc.
6. **Reference**: Font-mono reference number
7. **Status**: Color-coded badge (Paid=Green, Pending=Yellow)
8. **Actions**: View, Edit, Delete buttons

**Sample Data:**
- Electricity Bill: PKR 15,000 (Utilities, Paid)
- Staff Salaries: PKR 250,000 (Salaries, Paid)

---

### **2. Add Expense**

#### **Access Path:**
```
Pharmacy → Add Expense  OR  Click "Add Expense" button in Expense Management
```

#### **Form Fields:**

**Row 1 (2 columns):**
- **Expense Date*** (Date picker)
  - Required field
  - Default: Current date

- **Category*** (Dropdown)
  - Options:
    - Utilities
    - Salaries
    - Rent
    - Maintenance
    - Office Supplies
    - Marketing
    - Transport
    - Other

**Description Section:**
- **Description*** (Textarea, 3 rows)
  - Full expense details
  - Purpose and justification

**Row 2 (2 columns):**
- **Amount (PKR)*** (Number input)
  - Currency format
  - Placeholder: 0.00
  
- **Payment Method*** (Dropdown)
  - Options:
    - Cash
    - Bank Transfer
    - Cheque
    - Credit Card
    - Debit Card

**Row 3 (2 columns):**
- **Reference Number** (Text input)
  - Optional field
  - Format: REF-XXX
  
- **Status*** (Dropdown)
  - Options:
    - Paid
    - Pending

**Upload Section:**
- **Upload Receipt/Invoice** (Optional)
  - Drag and drop area
  - Dashed border
  - Upload icon
  - Supported formats: PDF, JPG, PNG
  - Max size: 5MB

**Action Buttons:**
- **Save Expense** (Blue primary button, full width)
  - Check circle icon
  - Saves and returns to expense list
  
- **Cancel** (Outline button)
  - Returns to expense list without saving

---

### **3. Expense Categories**

#### **Access Path:**
```
Pharmacy → Expense Categories
```

#### **Features:**

**Header:**
- Title: "Expense Categories"
- Subtitle: "Manage expense categories"
- "Add Category" button (Blue, Plus icon)

**Category Cards Grid (3 columns, 8 categories):**

Each card displays:
- **Color-coded icon** (Tag icon with category color):
  - Utilities: Blue (#3B82F6)
  - Salaries: Green (#10B981)
  - Rent: Purple (#8B5CF6)
  - Maintenance: Orange (#F97316)
  - Office Supplies: Pink (#EC4899)
  - Marketing: Cyan (#06B6D4)
  - Transport: Yellow (#EAB308)
  - Other: Gray (#6B7280)

- **Category Name** (Header)
- **Expense Count** (Badge)
- **Total Amount** (Bold text)
- **Edit Button** (Top right)

**Sample Categories:**

1. **Utilities**
   - Expenses: 1
   - Total: PKR 15,000
   - Blue icon background

2. **Salaries**
   - Expenses: 1
   - Total: PKR 250,000
   - Green icon background

3. **Rent**
   - Expenses: 0
   - Total: PKR 0
   - Purple icon background

4-8. **Other Categories**
   - All showing 0 expenses
   - Ready for data entry
   - Hover effect for interaction

---

### **4. Reports Module**

#### **Access Path:**
```
Pharmacy → Report
```

#### **4-Tab Report System:**

**Tab 1: Financial Reports**

**Financial Summary Card:**
- **3 Summary Boxes:**
  1. **Total Revenue** (Green background)
     - Sum of all sales
     - Green text
     
  2. **Total Expenses** (Red background)
     - Sum of all expenses
     - Red text
     
  3. **Net Profit** (Blue background)
     - Revenue minus Expenses
     - Blue text

- **Action Buttons:**
  - Export PDF (Download icon)
  - Print (Printer icon)

**Tab 2: Inventory Reports**

**Inventory Status Card:**
- **3 Summary Boxes:**
  1. **Total Items** (Blue)
     - Count of all medicines
     
  2. **In Stock** (Green)
     - Count of in-stock items
     
  3. **Low Stock** (Red)
     - Count of low/out of stock items

- **Export Excel** button

**Tab 3: Sales Reports**

**Sales Summary Card:**
- **4 Summary Boxes:**
  1. **Total Sales** (Purple)
     - Count of all sales
     
  2. **Completed** (Green)
     - Completed sales count
     
  3. **Pending** (Yellow)
     - Pending sales count
     
  4. **Revenue** (Cyan)
     - Total sales amount

- **Export Report** button

**Tab 4: Expense Reports**

**Expense Breakdown Card:**
- **Category Analysis** (2 columns):
  - Each category shows:
    - Category name
    - Percentage badge
    - Total amount
  
  Example:
  - **Utilities**: 5.7% | PKR 15,000
  - **Salaries**: 94.3% | PKR 250,000

- **Download Report** button

---

### **5. Create Purchase Order**

#### **Access Path:**
```
Pharmacy → Create Purchase Order  OR  Medicine → Create Purchase Order
```

#### **Form Sections:**

**PO Header (2 columns):**
- **PO Number*** (Auto-generated, disabled)
  - Format: PO-YYYY-NNN
  - Example: PO-2024-002
  
- **Order Date*** (Date picker)
  - Default: Current date

**Supplier & Delivery (2 columns):**
- **Supplier*** (Dropdown)
  - Lists all active suppliers
  - Options from supplier database
  
- **Expected Delivery Date*** (Date picker)
  - Future date selection
  - Delivery planning

**Order Items Section:**

**Header:**
- Title: "Order Items"
- "Add Item" button (Outline, Plus icon)

**Items Table (5 columns):**
1. **Medicine** (Dropdown)
   - All medicines from inventory
   - Shows: Name + Strength
   
2. **Quantity** (Number input)
   - Units to order
   - Width: 24 (compact)
   
3. **Unit Price** (Number input)
   - Price per unit
   - PKR format
   
4. **Total** (Calculated)
   - Quantity × Unit Price
   - Bold text
   - Auto-calculated
   
5. **Action** (Delete button)
   - Red trash icon
   - Removes item row

**Totals Section (Right-aligned):**
- **Subtotal**: Sum of all item totals
- **Tax (14%)**: Calculated from subtotal
- **Shipping**: Manual input field
- **Total**: Grand total (Blue, Large, Bold)
  - All calculations automatic

**Notes Section:**
- **Notes** (Textarea, 3 rows)
  - Additional instructions
  - Supplier notes
  - Special requirements

**Action Buttons:**
1. **Create Purchase Order** (Blue primary)
   - Check circle icon
   - Saves and creates PO
   
2. **Save as Draft** (Outline)
   - Saves without submitting
   
3. **Cancel** (Outline)
   - Returns to PO list

---

## Data Structure

### Expense Interface:
```typescript
interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  status: 'paid' | 'pending';
}
```

### Purchase Order Interface:
```typescript
interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  orderDate: string;
  expectedDate: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'draft' | 'pending' | 'approved' | 'received' | 'cancelled';
}

interface PurchaseOrderItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
```

---

## Mock Data Included

### Sample Expenses:
```javascript
{
  id: '1',
  date: '2024-11-08',
  category: 'Utilities',
  description: 'Electricity Bill - November',
  amount: 15000,
  paymentMethod: 'Bank Transfer',
  reference: 'REF-001',
  status: 'paid'
}

{
  id: '2',
  date: '2024-11-09',
  category: 'Salaries',
  description: 'Staff Salaries - November',
  amount: 250000,
  paymentMethod: 'Bank Transfer',
  reference: 'REF-002',
  status: 'paid'
}
```

### Sample Purchase Order:
```javascript
{
  id: '1',
  poNumber: 'PO-2024-001',
  supplier: 'MedSupply Co',
  orderDate: '2024-11-05',
  expectedDate: '2024-11-15',
  items: [
    {
      medicineId: '1',
      medicineName: 'Paracetamol 500mg',
      quantity: 1000,
      unitPrice: 2.5,
      total: 2500
    }
  ],
  subtotal: 2500,
  tax: 350,
  shipping: 150,
  total: 3000,
  status: 'pending'
}
```

---

## Navigation Structure

### Sidebar Menu:

**Pharmacy Section:**
- Dashboard
- Sales
- Add New Sale
- **Expense** ← Now working
- **Add Expense** ← Now working
- **Expense Categories** ← Now working
- **Report** ← Now working

**Medicine Section:**
- Medicine List
- Add Medicine
- Medicine Category
- Add Category
- Medicine Stock Alert
- Medicine Suppliers
- Add Supplier
- Purchase Orders
- **Create Purchase Order** ← Now working
- Medicine Batches
- Expiring Medicines

---

## Color Coding

### Expense Module:
- **Total Expenses**: Red gradient (PKR 265,000)
- **Today's Expenses**: Orange gradient
- **Paid Status**: Green badge
- **Pending Status**: Yellow badge
- **Amount Text**: Red bold text

### Category Cards:
- **8 Different Colors** for visual distinction
- **Hover Effect**: Shadow on mouse over
- **Icon Backgrounds**: Color-coded 12x12 squares

### Reports:
- **Revenue**: Green (#10B981)
- **Expenses**: Red (#EF4444)
- **Profit**: Blue (#3B82F6)
- **Other Metrics**: Purple, Yellow, Cyan

### Purchase Orders:
- **Total**: Blue (#3B82F6), Large font
- **Form Fields**: Standard input styling
- **Action Buttons**: Blue primary, Gray outline

---

## Key Features Summary

✅ **Expense Management** - Track all pharmacy expenses
✅ **Add Expense Form** - Comprehensive expense entry
✅ **Expense Categories** - 8 predefined categories with tracking
✅ **Reports Module** - 4-tab comprehensive reporting system
✅ **Create Purchase Order** - Full PO creation with items, calculations, and totals
✅ **Mock Data** - Sample expenses and purchase orders for testing
✅ **Navigation Integration** - All modules accessible from sidebar
✅ **Professional Design** - HMS color scheme (Blue/Green)
✅ **Responsive Layout** - Works on all screen sizes
✅ **Auto-calculations** - Totals, taxes, and subtotals computed automatically

---

## Workflow Examples

### Adding an Expense:
1. Click "Add Expense" in sidebar or expense page
2. Fill expense date
3. Select category
4. Enter description
5. Enter amount
6. Select payment method
7. Add reference number (optional)
8. Set status (Paid/Pending)
9. Upload receipt (optional)
10. Click "Save Expense"
11. Returns to expense list

### Creating a Purchase Order:
1. Click "Create Purchase Order"
2. PO number auto-generated
3. Set order date
4. Select supplier
5. Choose expected delivery date
6. Click "Add Item"
7. Select medicine from dropdown
8. Enter quantity
9. Enter unit price
10. Total calculates automatically
11. Add more items as needed
12. Enter shipping cost
13. Review calculated totals
14. Add notes if needed
15. Click "Create Purchase Order"
16. PO saved and submitted

### Viewing Reports:
1. Click "Report" in sidebar
2. Select tab:
   - Financial: See revenue, expenses, profit
   - Inventory: View stock levels
   - Sales: Analyze sales performance
   - Expense: Review expense breakdown
3. Click export/print button
4. Download or print report

---

## Integration Points

✅ **Expense tracking** integrates with financial reports
✅ **Purchase orders** link to supplier records
✅ **Categories** filter expense views
✅ **Reports** pull from sales, expenses, inventory
✅ **Navigation** seamless between all modules

---

All pharmacy expense and purchase order modules are now fully functional and integrated!
