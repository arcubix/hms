# Permissions Mapping Documentation

This document maps all permissions in the HMS system to their purposes, features, API endpoints, and UI components.

## Permission System Overview

The HMS permission system uses a role-based access control (RBAC) model with the following components:

1. **Permission Definitions**: Master list of all available permissions (`permission_definitions` table)
2. **Role Permissions**: Default permissions assigned to roles (`role_permissions` table)
3. **User Custom Permissions**: Custom permission overrides for specific users (`user_custom_permissions` table)

### Permission Resolution Logic

User permissions are resolved in the following order:
1. Start with permissions from user's role(s)
2. Apply custom permission overrides (granted permissions add, denied permissions remove)

## Permission Categories

### Admin Permissions

| Permission Key | Name | Description | API Endpoints | UI Components |
|---------------|------|-------------|---------------|---------------|
| `admin.view_users` | View Users | View user list and details | `GET /api/users`, `GET /api/users/:id` | User Management, Audit Logs, System Settings |
| `admin.create_users` | Create Users | Create new user accounts | `POST /api/users` | Add User form |
| `admin.edit_users` | Edit Users | Edit user accounts and settings | `PUT /api/users/:id`, `PUT /api/users/:id/settings` | User Settings, Edit User form |
| `admin.delete_users` | Delete Users | Delete user accounts | `DELETE /api/users/:id` | Delete User button |
| `admin.view_financial_reports` | View Financial Reports | Access financial reports and analytics | `GET /api/dashboard/stats` | Dashboard Analytics, Reports |
| `admin.view_other_reports` | View Other Reports | Access various system reports | `GET /api/reports/*` | Reports module |
| `admin.delete_patient` | Delete Patient | Delete patient records | `DELETE /api/patients/:id` | Delete Patient button |
| `admin.edit_payment_invoice_date` | Edit Payment/Invoice Date | Modify payment and invoice dates | `PUT /api/invoices/:id` | Invoice Edit form |
| `admin.edit_expenses` | Edit Expenses | Edit expense records | `PUT /api/expenses/:id` | Expense Edit form |

### Doctor Permissions

| Permission Key | Name | Description | API Endpoints | UI Components |
|---------------|------|-------------|---------------|---------------|
| `doctor.view_patient_profiles` | View Patient Profiles | View patient profile information | `GET /api/patients/:id` | Patient Profile view |
| `doctor.view_all_patients` | View All Patients | View all patients in the system | `GET /api/patients` | Patient List |
| `doctor.search_view_patients` | Search and View Patients | Search and view patient records | `GET /api/patients?search=*` | Patient Search |
| `doctor.view_patients_report` | View Patients Report | View patient reports | `GET /api/reports/patients` | Patient Reports |
| `doctor.create_health_records` | Create Health Records | Create new health records | `POST /api/health-records` | Add Health Record form |
| `doctor.edit_health_records` | Edit Health Records | Edit existing health records | `PUT /api/health-records/:id` | Edit Health Record form |
| `doctor.add_appointment` | Add Appointment | Add new appointments | `POST /api/appointments` | Add Appointment form |
| `doctor.delete_token_appointment` | Delete Token/Appointment | Delete tokens and appointments | `DELETE /api/appointments/:id` | Delete Appointment button |
| `doctor.create_invoice` | Create Invoice | Create new invoices | `POST /api/invoices` | Create Invoice form |
| `doctor.edit_invoices` | Edit Invoices | Edit invoice details | `PUT /api/invoices/:id` | Edit Invoice form |
| `doctor.edit_payment_invoice_date` | Edit Payment/Invoice Date | Edit payment and invoice dates | `PUT /api/invoices/:id` | Invoice Date Edit |
| `doctor.delete_patient` | Delete Patient | Delete patient records | `DELETE /api/patients/:id` | Delete Patient button |
| `doctor.emergency_consultant` | Emergency Consultant | Access to emergency consultation features | `GET /api/emergency/*` | Emergency module |

### Laboratory Manager Permissions

| Permission Key | Name | Description | API Endpoints | UI Components |
|---------------|------|-------------|---------------|---------------|
| `lab_manager.create_lab_invoice` | Create Laboratory Invoice | Create laboratory invoices | `POST /api/lab/invoices` | Create Lab Invoice form |
| `lab_manager.view_lab_reports` | View Laboratory Reports | View laboratory test reports | `GET /api/lab-tests`, `GET /api/lab-tests/:id` | Lab Reports view |
| `lab_manager.edit_lab_reports` | Edit Lab Reports | Edit laboratory test reports | `PUT /api/lab-tests/:id` | Edit Lab Report form |
| `lab_manager.delete_lab_reports` | Delete Laboratory Reports | Delete laboratory reports | `DELETE /api/lab-tests/:id` | Delete Lab Report button |
| `lab_manager.edit_lab_templates` | Edit Lab Templates | Edit laboratory test templates | `PUT /api/lab/templates/:id` | Edit Lab Template form |
| `lab_manager.delete_lab_templates` | Delete Lab Templates | Delete laboratory test templates | `DELETE /api/lab/templates/:id` | Delete Template button |
| `lab_manager.edit_outsourced_labs` | Edit Outsourced Labs | Edit outsourced laboratory information | `PUT /api/lab/outsourced/:id` | Edit Outsourced Lab form |
| `lab_manager.view_inventory_requisition` | View Inventory Purchase Requisition | View inventory purchase requisitions | `GET /api/lab/inventory-requisitions` | Inventory Requisitions view |
| `lab_manager.revert_completed_reports` | Revert Completed Reports | Revert completed laboratory reports | `PUT /api/lab-tests/:id/revert` | Revert Report button |

### Laboratory Technician Permissions

| Permission Key | Name | Description | API Endpoints | UI Components |
|---------------|------|-------------|---------------|---------------|
| `lab_technician.create_lab_invoice` | Create Laboratory Invoice | Create laboratory invoices | `POST /api/lab/invoices` | Create Lab Invoice form |
| `lab_technician.view_lab_reports` | View Laboratory Reports | View laboratory test reports | `GET /api/lab-tests`, `GET /api/lab-tests/:id` | Lab Reports view |
| `lab_technician.create_lab_reports` | Create Lab Reports | Create laboratory test reports | `POST /api/lab-tests` | Create Lab Report form |
| `lab_technician.edit_lab_reports` | Edit Lab Reports | Edit laboratory test reports | `PUT /api/lab-tests/:id` | Edit Lab Report form |
| `lab_technician.delete_lab_reports` | Delete Lab Reports | Delete laboratory reports | `DELETE /api/lab-tests/:id` | Delete Lab Report button |
| `lab_technician.edit_lab_templates` | Edit Lab Templates | Edit laboratory test templates | `PUT /api/lab/templates/:id` | Edit Lab Template form |
| `lab_technician.delete_lab_templates` | Delete Lab Templates | Delete laboratory test templates | `DELETE /api/lab/templates/:id` | Delete Template button |
| `lab_technician.edit_lab_number` | Edit Lab# | Edit laboratory test numbers | `PUT /api/lab-tests/:id/number` | Edit Lab Number field |
| `lab_technician.validate_tests` | Validate Tests | Validate laboratory tests | `PUT /api/lab-tests/:id/validate` | Validate Test button |
| `lab_technician.edit_procedure_rates` | Edit Procedure Rates | Edit procedure rates on invoices | `PUT /api/lab/invoices/:id/rates` | Edit Rates form |
| `lab_technician.collect_sample` | Collect Sample | Collect patient samples | `POST /api/lab/samples` | Collect Sample form |
| `lab_technician.lab_tracking` | Lab Tracking | Track laboratory samples | `GET /api/lab/tracking` | Lab Tracking view |
| `lab_technician.enter_results` | Enter Results | Enter test results | `PUT /api/lab-tests/:id/results` | Enter Results form |
| `lab_technician.lab_templates` | Lab Templates | Access laboratory templates | `GET /api/lab/templates` | Lab Templates view |
| `lab_technician.view_completed_reports` | View Completed Reports | View completed laboratory reports | `GET /api/lab-tests?status=completed` | Completed Reports view |
| `lab_technician.view_inventory_requisition` | View Inventory Purchase Requisition | View inventory purchase requisitions | `GET /api/lab/inventory-requisitions` | Inventory Requisitions view |

### Radiology Technician Permissions

| Permission Key | Name | Description | API Endpoints | UI Components |
|---------------|------|-------------|---------------|---------------|
| `radiology_technician.view_radiology_reports` | View Radiology Reports | View radiology reports | `GET /api/radiology-tests`, `GET /api/radiology-tests/:id` | Radiology Reports view |
| `radiology_technician.add_radiology_reports` | Add Radiology Reports | Add new radiology reports | `POST /api/radiology-tests` | Add Radiology Report form |
| `radiology_technician.edit_radiology_procedures` | Edit Radiology Procedures | Edit radiology procedures | `PUT /api/radiology-tests/:id` | Edit Procedure form |
| `radiology_technician.create_radiology_procedures` | Create Radiology Procedures | Create new radiology procedures | `POST /api/radiology/procedures` | Create Procedure form |
| `radiology_technician.delete_radiology_procedures` | Delete Radiology Procedures | Delete radiology procedures | `DELETE /api/radiology/procedures/:id` | Delete Procedure button |
| `radiology_technician.radiology_procedures` | Radiology Procedures | Access radiology procedures | `GET /api/radiology/procedures` | Procedures view |
| `radiology_technician.radiology_referrals` | Radiology Referrals | Manage radiology referrals | `GET /api/radiology/referrals` | Referrals view |
| `radiology_technician.radiology_invoice` | Radiology Invoice | Create radiology invoices | `POST /api/radiology/invoices` | Create Invoice form |
| `radiology_technician.enter_results` | Enter Results | Enter radiology test results | `PUT /api/radiology-tests/:id/results` | Enter Results form |
| `radiology_technician.validate_tests` | Validate Tests | Validate radiology tests | `PUT /api/radiology-tests/:id/validate` | Validate Test button |
| `radiology_technician.view_completed_reports` | View Completed Reports | View completed radiology reports | `GET /api/radiology-tests?status=completed` | Completed Reports view |
| `radiology_technician.view_inventory_requisition` | View Inventory Purchase Requisition | View inventory purchase requisitions | `GET /api/radiology/inventory-requisitions` | Inventory Requisitions view |

### Radiology Manager Permissions

| Permission Key | Name | Description | API Endpoints | UI Components |
|---------------|------|-------------|---------------|---------------|
| `radiology_manager.view_radiology_reports` | View Radiology Reports | View radiology reports | `GET /api/radiology-tests`, `GET /api/radiology-tests/:id` | Radiology Reports view |
| `radiology_manager.edit_radiology_report` | Edit Radiology Report | Edit radiology reports | `PUT /api/radiology-tests/:id` | Edit Report form |
| `radiology_manager.delete_radiology_report` | Delete Radiology Report | Delete radiology reports | `DELETE /api/radiology-tests/:id` | Delete Report button |
| `radiology_manager.edit_radiology_procedure` | Edit Radiology Procedure | Edit radiology procedures | `PUT /api/radiology/procedures/:id` | Edit Procedure form |
| `radiology_manager.delete_radiology_procedure` | Delete Radiology Procedure | Delete radiology procedures | `DELETE /api/radiology/procedures/:id` | Delete Procedure button |
| `radiology_manager.create_radiology_invoice` | Create Radiology Invoice | Create radiology invoices | `POST /api/radiology/invoices` | Create Invoice form |
| `radiology_manager.revert_completed_tests` | Revert Completed Tests | Revert completed radiology tests | `PUT /api/radiology-tests/:id/revert` | Revert Test button |
| `radiology_manager.edit_users` | Edit Users | Edit user accounts | `PUT /api/users/:id` | Edit User form |
| `radiology_manager.create_users` | Create Users | Create new user accounts | `POST /api/users` | Add User form |
| `radiology_manager.view_inventory_requisition` | View Inventory Purchase Requisition | View inventory purchase requisitions | `GET /api/radiology/inventory-requisitions` | Inventory Requisitions view |

## API Endpoint Permission Mapping

### Users Controller (`/api/users`)

| Method | Endpoint | Required Permission(s) |
|--------|----------|------------------------|
| GET | `/api/users` | `admin.view_users` OR `admin.edit_users` |
| POST | `/api/users` | `admin.create_users` |
| GET | `/api/users/:id` | `admin.view_users` |
| PUT | `/api/users/:id` | `admin.edit_users` |
| DELETE | `/api/users/:id` | `admin.delete_users` |
| GET | `/api/users/:id/permissions` | `admin.edit_users` |
| PUT | `/api/users/:id/permissions` | `admin.edit_users` |
| GET | `/api/users/:id/settings` | `admin.edit_users` |
| PUT | `/api/users/:id/settings` | `admin.edit_users` |
| GET | `/api/users/roles` | `admin.view_users` |
| GET | `/api/users/permissions/definitions` | `admin.view_users` |
| GET | `/api/users/permissions/role-mappings` | `admin.view_users` |
| GET | `/api/users/roles/:role/permissions` | `admin.edit_users` |
| PUT | `/api/users/roles/:role/permissions` | `admin.edit_users` |

### Patients Controller (`/api/patients`)

| Method | Endpoint | Required Permission(s) |
|--------|----------|------------------------|
| GET | `/api/patients` | `doctor.view_all_patients` OR `doctor.search_view_patients` |
| POST | `/api/patients` | `doctor.view_all_patients` OR `doctor.search_view_patients` |
| GET | `/api/patients/:id` | `doctor.view_patient_profiles` OR `doctor.view_all_patients` |
| PUT | `/api/patients/:id` | `doctor.view_all_patients` OR `doctor.search_view_patients` |
| DELETE | `/api/patients/:id` | `doctor.delete_patient` OR `admin.delete_patient` |

### Lab Tests Controller (`/api/lab-tests`)

| Method | Endpoint | Required Permission(s) |
|--------|----------|------------------------|
| GET | `/api/lab-tests` | `lab_manager.view_lab_reports` OR `lab_technician.view_lab_reports` |
| POST | `/api/lab-tests` | `lab_technician.create_lab_reports` OR `lab_manager.create_lab_invoice` |
| GET | `/api/lab-tests/:id` | `lab_manager.view_lab_reports` OR `lab_technician.view_lab_reports` |
| PUT | `/api/lab-tests/:id` | `lab_technician.edit_lab_reports` OR `lab_manager.edit_lab_reports` |
| DELETE | `/api/lab-tests/:id` | `lab_technician.delete_lab_reports` OR `lab_manager.delete_lab_reports` |

### Radiology Tests Controller (`/api/radiology-tests`)

| Method | Endpoint | Required Permission(s) |
|--------|----------|------------------------|
| GET | `/api/radiology-tests` | `radiology_manager.view_radiology_reports` OR `radiology_technician.view_radiology_reports` |
| POST | `/api/radiology-tests` | `radiology_technician.add_radiology_reports` |
| GET | `/api/radiology-tests/:id` | `radiology_manager.view_radiology_reports` OR `radiology_technician.view_radiology_reports` |
| PUT | `/api/radiology-tests/:id` | `radiology_manager.edit_radiology_report` OR `radiology_technician.edit_radiology_procedures` |
| DELETE | `/api/radiology-tests/:id` | `radiology_manager.delete_radiology_report` |

### System Settings Controller (`/api/system-settings`)

| Method | Endpoint | Required Permission(s) |
|--------|----------|------------------------|
| GET | `/api/system-settings` | `admin.view_users` |
| PUT | `/api/system-settings` | `admin.view_users` |
| GET | `/api/system-settings/:key` | None (authenticated users) |
| PUT | `/api/system-settings/:key` | `admin.view_users` |

### Audit Logs Controller (`/api/audit-logs`)

| Method | Endpoint | Required Permission(s) |
|--------|----------|------------------------|
| GET | `/api/audit-logs` | `admin.view_users` |
| GET | `/api/audit-logs/:id` | `admin.view_users` |
| GET | `/api/audit-logs/export` | `admin.view_users` |

## Frontend Component Usage

### Using PermissionGuard

```tsx
import { PermissionGuard } from '../components/common/PermissionGuard';

// Single permission
<PermissionGuard permission="admin.delete_users">
  <button onClick={handleDelete}>Delete User</button>
</PermissionGuard>

// Multiple permissions (require ANY)
<PermissionGuard permissions={['admin.edit_users', 'admin.create_users']}>
  <button>Edit User</button>
</PermissionGuard>

// Multiple permissions (require ALL)
<PermissionGuard permissions={['admin.edit_users', 'admin.delete_users']} requireAll>
  <button>Advanced Action</button>
</PermissionGuard>

// With fallback
<PermissionGuard permission="admin.view_users" fallback={<div>Access Denied</div>}>
  <UserList />
</PermissionGuard>
```

### Using PermissionButton

```tsx
import { PermissionButton } from '../components/common/PermissionButton';

// Single permission
<PermissionButton 
  permission="admin.delete_users"
  tooltipMessage="You need delete permission to perform this action"
  onClick={handleDelete}
>
  Delete User
</PermissionButton>

// Multiple permissions
<PermissionButton 
  permissions={['admin.edit_users', 'admin.create_users']}
  requireAll={false}
  onClick={handleEdit}
>
  Edit User
</PermissionButton>
```

### Using usePermissions Hook

```tsx
import { usePermissions } from '../contexts/PermissionContext';

function MyComponent() {
  const { hasPermission, hasAnyPermission, hasAllPermissions, permissions } = usePermissions();

  if (hasPermission('admin.view_users')) {
    // Show admin content
  }

  if (hasAnyPermission(['admin.edit_users', 'admin.create_users'])) {
    // Show edit/create content
  }

  return <div>Content</div>;
}
```

## Permission Inheritance

Permissions are inherited from roles as follows:

1. **Role Assignment**: Users are assigned one or more roles
2. **Role Permissions**: Each role has a set of default permissions
3. **Custom Overrides**: Individual users can have custom permission overrides
   - **Granted**: Adds a permission even if not in role
   - **Denied**: Removes a permission even if in role

### Example Permission Resolution

User: John Doe
- Role: `doctor`
- Role Permissions: `doctor.view_patient_profiles`, `doctor.view_all_patients`, `doctor.add_appointment`
- Custom Permissions:
  - `admin.view_users` (granted)
  - `doctor.add_appointment` (denied)

**Final Permissions**: `doctor.view_patient_profiles`, `doctor.view_all_patients`, `admin.view_users`

## Best Practices

1. **Always check permissions on the backend**: Frontend checks are for UX only
2. **Use specific permissions**: Prefer specific permissions over broad role checks
3. **Document permission requirements**: Update this document when adding new permissions
4. **Test permission combinations**: Ensure custom overrides work correctly
5. **Cache permissions**: Permissions are cached per request on backend for performance

## Adding New Permissions

When adding new permissions:

1. Add permission definition to `permission_definitions` table
2. Assign to appropriate roles in `role_permissions` table
3. Update this documentation
4. Add permission checks to relevant API endpoints
5. Add permission checks to relevant UI components
6. Update permission mapping config (`application/config/permissions.php`)

