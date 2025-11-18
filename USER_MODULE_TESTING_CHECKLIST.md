# User Module Testing Checklist

## Overview
This document provides a comprehensive testing checklist for the User Management module implementation.

## Pre-Testing Setup

### Database Setup
- [ ] Run `database/users_schema.sql` to extend users table
- [ ] Run `database/user_permissions_schema.sql` to create permissions tables
- [ ] Run `database/permissions_master_data.sql` to populate permission definitions
- [ ] Verify all tables are created successfully
- [ ] Verify foreign key constraints are in place

### Backend Setup
- [ ] Verify `application/models/User_model.php` is updated with new methods
- [ ] Verify `application/controllers/Users.php` is created
- [ ] Verify API routes are accessible
- [ ] Test API endpoints with Postman/curl

### Frontend Setup
- [ ] Verify all TypeScript types are defined in `frontend/src/types/user.ts`
- [ ] Verify API service methods are added to `frontend/src/services/api.ts`
- [ ] Verify all components are created:
  - [ ] `AddUser.tsx`
  - [ ] `UserList.tsx`
  - [ ] `UserSettings.tsx`

## Functional Testing

### 1. User Creation (AddUser Component)

#### Tab 1: Biography Data
- [ ] Name field accepts text input
- [ ] Gender radio buttons work (Male/Female/Other)
- [ ] Phone field accepts phone number format
- [ ] Email field validates email format
- [ ] Password field accepts password (required for new users)
- [ ] Doctor departments field accepts multiple departments
- [ ] Shift dropdown works
- [ ] Role checkboxes work (multiple selection)
- [ ] OPD/IPD checkboxes work
- [ ] Token/Appointment radio buttons work
- [ ] Required field validation works
- [ ] Email format validation works
- [ ] Phone format validation works

#### Tab 2: Biography
- [ ] Professional Statement textarea works
- [ ] Awards field accepts input
- [ ] Expertise field accepts input
- [ ] Registrations field accepts input
- [ ] Professional Memberships field accepts input
- [ ] Languages field accepts input (default: "English, Urdu")
- [ ] Experience field accepts input
- [ ] Degree Completion Date date picker works
- [ ] Summary textarea works
- [ ] PMDC field accepts input (default: "Pmdc")

#### Tab 3: Qualification
- [ ] Add qualification button works
- [ ] Multiple qualification fields can be added
- [ ] Remove qualification button works
- [ ] Qualification fields accept text input
- [ ] At least one qualification validation works

#### Tab 4: Service
- [ ] Add service button works
- [ ] Multiple service fields can be added
- [ ] Remove service button works
- [ ] Service fields accept text input
- [ ] At least one service validation works

#### Tab 5: Timings
- [ ] All 7 days of week are displayed
- [ ] Available checkbox works for each day
- [ ] Toggle all available checkbox works
- [ ] Start time time picker works
- [ ] End time time picker works
- [ ] Duration number input works
- [ ] At least one day available validation works
- [ ] Time format validation works
- [ ] Duration range validation works (5-120 minutes)

#### Tab 6: FAQs
- [ ] Add FAQ button works
- [ ] Multiple FAQ entries can be added
- [ ] Remove FAQ button works
- [ ] Question field accepts input
- [ ] Answer textarea works
- [ ] FAQ validation works (both question and answer required)

#### Tab 7: Share Procedures
- [ ] Add Doctor Share button works
- [ ] Multiple share procedures can be added
- [ ] Remove share procedure button works
- [ ] Procedure name field accepts input
- [ ] Share type dropdown works (percentage/rupees)
- [ ] Share value number input works
- [ ] Share procedure validation works

#### Navigation
- [ ] Previous button works (disabled on first tab)
- [ ] Next button works (disabled on last tab)
- [ ] Save Draft button works
- [ ] Tab navigation works
- [ ] Form submission works on last tab

### 2. User List (UserList Component)

- [ ] Users are displayed in grid view
- [ ] Search functionality works (name, email, phone)
- [ ] Status filter works (All/Active/Inactive)
- [ ] Role filter works
- [ ] User cards display correct information:
  - [ ] Avatar with initials
  - [ ] Name and email
  - [ ] Status badge
  - [ ] Roles badges
  - [ ] Phone number
- [ ] View button navigates to user profile
- [ ] Edit button navigates to edit user form
- [ ] Delete button works with confirmation
- [ ] Empty state displays when no users found
- [ ] Loading state displays while fetching

### 3. User Settings (UserSettings Component)

#### General Settings
- [ ] Consultation fee input works
- [ ] Follow up charges input works
- [ ] Follow up share price input works
- [ ] Share price input works
- [ ] Share type dropdown works (Rupees/Percentage)
- [ ] Lab share value and type work
- [ ] Radiology share value and type work
- [ ] Instant Booking checkbox works
- [ ] Visit Charges checkbox works
- [ ] Invoice Edit Count input works

#### Follow Up Share Types
- [ ] All follow up share type checkboxes work
- [ ] Multiple selections work
- [ ] Deselection works

#### Role Permissions
- [ ] Doctor Role User Rights checkboxes work
- [ ] Admin Role User Rights checkboxes work
- [ ] Laboratory Manager User Rights checkboxes work
- [ ] Laboratory Technician User Rights checkboxes work
- [ ] Radiology Technician User Rights checkboxes work
- [ ] Radiology Manager User Rights checkboxes work
- [ ] Permissions are loaded from API
- [ ] Permissions can be toggled
- [ ] Save Settings button works

### 4. API Integration

#### User CRUD
- [ ] GET /api/users - List users with filters
- [ ] POST /api/users - Create user
- [ ] GET /api/users/:id - Get user details
- [ ] PUT /api/users/:id - Update user
- [ ] DELETE /api/users/:id - Delete user

#### Permissions
- [ ] GET /api/users/:id/permissions - Get user permissions
- [ ] PUT /api/users/:id/permissions - Update user permissions
- [ ] GET /api/users/permissions/definitions - Get permission definitions

#### Settings
- [ ] GET /api/users/:id/settings - Get user settings
- [ ] PUT /api/users/:id/settings - Update user settings

#### Roles
- [ ] GET /api/users/roles - Get available roles

### 5. Data Validation

#### Client-Side Validation
- [ ] Required fields are validated
- [ ] Email format is validated
- [ ] Phone format is validated
- [ ] Password strength is validated (if applicable)
- [ ] Date ranges are validated
- [ ] Number ranges are validated
- [ ] Error messages display correctly
- [ ] Validation errors clear on correction

#### Server-Side Validation
- [ ] Duplicate email check works
- [ ] Duplicate phone check works
- [ ] Role assignment validation works
- [ ] Permission validation works
- [ ] Data integrity checks work
- [ ] Transaction rollback works on error

### 6. Error Handling

- [ ] Network errors are handled gracefully
- [ ] API errors display user-friendly messages
- [ ] Validation errors display field-specific messages
- [ ] Loading states display during API calls
- [ ] Error states display when operations fail

### 7. User Experience

- [ ] Form navigation is intuitive
- [ ] Progress indicator shows current tab
- [ ] Save draft functionality works
- [ ] Success messages display after operations
- [ ] Error messages are clear and actionable
- [ ] Loading indicators show during operations
- [ ] Form state persists during navigation
- [ ] Responsive design works on mobile/tablet

## Integration Testing

### User Creation Flow
1. [ ] Navigate to Add User page
2. [ ] Fill all 7 tabs with valid data
3. [ ] Submit form
4. [ ] Verify user is created in database
5. [ ] Verify all related data is saved:
   - [ ] Roles
   - [ ] Departments
   - [ ] Qualifications
   - [ ] Services
   - [ ] Timings
   - [ ] FAQs
   - [ ] Share Procedures
   - [ ] Follow Up Share Types

### User Update Flow
1. [ ] Navigate to user list
2. [ ] Click Edit on a user
3. [ ] Modify user data
4. [ ] Submit form
5. [ ] Verify changes are saved
6. [ ] Verify related data is updated correctly

### User Settings Flow
1. [ ] Navigate to user settings
2. [ ] Modify settings
3. [ ] Modify permissions
4. [ ] Save settings
5. [ ] Verify settings are saved
6. [ ] Verify permissions are updated

### User Deletion Flow
1. [ ] Navigate to user list
2. [ ] Click Delete on a user
3. [ ] Confirm deletion
4. [ ] Verify user is deleted
5. [ ] Verify cascade deletion works (related records)

## Performance Testing

- [ ] User list loads quickly with many users
- [ ] Search is responsive
- [ ] Filters work efficiently
- [ ] Form submission is fast
- [ ] No memory leaks in components
- [ ] API calls are optimized

## Security Testing

- [ ] Password is hashed before storage
- [ ] API endpoints require authentication
- [ ] User permissions are enforced
- [ ] SQL injection prevention works
- [ ] XSS prevention works
- [ ] CSRF protection works (if applicable)

## Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Form labels are properly associated
- [ ] Error messages are accessible
- [ ] Color contrast meets WCAG standards

## Edge Cases

- [ ] Creating user with duplicate email
- [ ] Creating user with duplicate phone
- [ ] Creating user with no roles
- [ ] Creating user with no qualifications
- [ ] Creating user with no services
- [ ] Creating user with no available days
- [ ] Updating user with invalid data
- [ ] Deleting user with related records
- [ ] Large form data submission
- [ ] Special characters in form fields
- [ ] Very long text in textareas
- [ ] Network timeout handling
- [ ] Concurrent user modifications

## Regression Testing

- [ ] Existing user functionality still works
- [ ] Doctor module still works
- [ ] Patient module still works
- [ ] Other modules are not affected

## Documentation

- [ ] API documentation is updated
- [ ] Component documentation is complete
- [ ] Database schema is documented
- [ ] User guide is available (if applicable)

## Sign-off

- [ ] All critical tests passed
- [ ] All high-priority tests passed
- [ ] Known issues documented
- [ ] Ready for production deployment

---

## Notes

- Test with sample data matching the screenshots
- Verify all form fields match the UI design
- Ensure data persistence across page refreshes
- Test with different user roles and permissions
- Verify error handling for all edge cases

