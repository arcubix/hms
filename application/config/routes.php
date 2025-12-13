<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/*
| -------------------------------------------------------------------------
| URI ROUTING
| -------------------------------------------------------------------------
| This file lets you re-map URI requests to specific controller functions.
|
| Typically there is a one-to-one relationship between a URL string
| and its corresponding controller class/method. The segments in a
| URL normally follow this pattern:
|
|	example.com/class/method/id/
|
| In some instances, however, you may want to remap this relationship
| so that a different class/function is called than the one
| corresponding to the URL.
|
| Please see the user guide for complete details:
|
|	https://codeigniter.com/userguide3/general/routing.html
|
| -------------------------------------------------------------------------
| RESERVED ROUTES
| -------------------------------------------------------------------------
|
| There are three reserved routes:
|
|	$route['default_controller'] = 'welcome';
|
| This route indicates which controller class should be loaded if the
| URI contains no data. In the above example, the "welcome" class
| would be loaded.
|
|	$route['404_override'] = 'errors/page_missing';
|
| This route will tell the Router which controller/method to use if those
| provided in the URL cannot be matched to a valid route.
|
|	$route['translate_uri_dashes'] = FALSE;
|
| This is not exactly a route, but allows you to automatically route
| controller and method names that contain dashes. '-' isn't a valid
| class or method name character, so it requires translation.
| When you set this option to TRUE, it will replace ALL dashes in the
| controller and method URI segments.
|
| Examples:	my-controller/index	-> my_controller/index
|		my-controller/my-method	-> my_controller/my_method
*/
$route['default_controller'] = 'welcome';
$route['404_override'] = '';
$route['translate_uri_dashes'] = FALSE;

// Test Route
$route['api/test'] = 'test/index';

// API Routes
$route['api/auth/login'] = 'auth/login';
$route['api/auth/logout'] = 'auth/logout';
$route['api/patients'] = 'patients/index';
$route['api/patients/(:any)'] = 'patients/get/$1';
$route['api/doctors'] = 'doctors/index';
$route['api/doctors/(:num)'] = 'doctors/get/$1';
$route['api/doctors/(:num)/schedule'] = 'doctors/schedule/$1';
$route['api/appointments'] = 'appointments/index';
$route['api/appointments/(:num)'] = 'appointments/get/$1';
$route['api/appointments/(:num)/status'] = 'appointments/update_status/$1';
$route['api/appointments/(:num)/payment'] = 'appointments/payment/$1';
$route['api/appointments/doctor/(:num)/slots'] = 'appointments/get_available_slots/$1';
$route['api/appointments/doctor/(:num)/available-dates'] = 'appointments/get_available_dates/$1';
$route['api/appointments/doctor/(:num)'] = 'appointments/get_by_doctor/$1';
$route['api/appointments/patient/(:num)'] = 'appointments/get_by_patient/$1';
$route['api/prescriptions'] = 'prescriptions/index';
$route['api/prescriptions/(:num)'] = 'prescriptions/get/$1';
$route['api/medicines'] = 'medicines/index';
$route['api/medicines/(:num)'] = 'medicines/get/$1';
$route['api/lab-tests'] = 'lab_tests/index';
$route['api/lab-tests/(:num)'] = 'lab_tests/get/$1';
$route['api/lab-tests/categories'] = 'lab_tests/categories';
$route['api/lab-tests/types'] = 'lab_tests/types';
$route['api/lab-tests/sample-types'] = 'lab_tests/sample_types';
$route['api/radiology-tests'] = 'radiology_tests/index';
$route['api/radiology-tests/(:num)'] = 'radiology_tests/get/$1';
$route['api/emergency/visits'] = 'emergency/index';
$route['api/emergency/visits/(:num)'] = 'emergency/get/$1';
$route['api/emergency/visits/(:num)/triage'] = 'emergency/update_triage/$1';
$route['api/emergency/visits/(:num)/disposition'] = 'emergency/update_disposition/$1';
$route['api/emergency/visits/(:num)/status'] = 'emergency/update_status/$1';
$route['api/emergency/visits/(:num)/vitals'] = 'emergency/vitals/$1';
$route['api/emergency/visits/(:num)/notes'] = 'emergency/notes/$1';
$route['api/emergency/visits/(:num)/investigations'] = 'emergency/investigations/$1';
$route['api/emergency/visits/(:num)/medications'] = 'emergency/medications/$1';
$route['api/emergency/visits/(:num)/charges'] = 'emergency/charges/$1';
$route['api/emergency/visits/(:num)/charges/(:num)'] = 'emergency/charges/$1/$2';
$route['api/emergency/visits/(:num)/history'] = 'emergency/history/$1';
$route['api/emergency/visits/(:num)/admit-ipd'] = 'emergency/admit_ipd/$1';
$route['api/emergency/visits/(:num)/ward-assignment'] = 'emergency/ward_assignment/$1';
$route['api/emergency/visits/(:num)/files'] = 'emergency/files/$1';
$route['api/emergency/visits/(:num)/files/(:num)'] = 'emergency/delete_file/$1/$2';
$route['api/emergency/visits/(:num)/intake-output'] = 'emergency/intake_output/$1';
$route['api/emergency/visits/(:num)/blood-bank'] = 'emergency/blood_bank/$1';
$route['api/emergency/visits/(:num)/blood-bank/(:num)'] = 'emergency/update_blood_request/$1/$2';
$route['api/emergency/visits/(:num)/health-physical'] = 'emergency/health_physical/$1';
$route['api/emergency/visits/(:num)/timeline'] = 'emergency/timeline/$1';
$route['api/emergency/stats'] = 'emergency/stats';
$route['api/emergency/beds'] = 'emergency/beds';
$route['api/emergency/admitted-patients'] = 'emergency/admitted_patients';
$route['api/emergency/history'] = 'emergency/history_list';

// Emergency Wards Management
$route['api/emergency/wards'] = 'emergency/wards';
$route['api/emergency/wards/(:num)'] = 'emergency/wards/$1';
$route['api/emergency/wards/(:num)/stats'] = 'emergency/ward_stats/$1';
$route['api/emergency/wards/(:num)/beds'] = 'emergency/ward_beds/$1';

// Emergency Ward Beds Management
$route['api/emergency/ward-beds'] = 'emergency/ward_beds_management';
$route['api/emergency/ward-beds/(:num)'] = 'emergency/ward_beds_management/$1';
$route['api/emergency/ward-beds/(:num)/assign'] = 'emergency/assign_bed/$1';
$route['api/emergency/ward-beds/(:num)/release'] = 'emergency/release_bed/$1';
$route['api/emergency/ward-beds/available'] = 'emergency/available_beds';

// Emergency Duty Roster
$route['api/emergency/duty-roster'] = 'emergency/duty_roster';
$route['api/emergency/duty-roster/(:num)'] = 'emergency/duty_roster/$1';
$route['api/emergency/duty-roster/date/(:any)'] = 'emergency/duty_roster_date/$1';
$route['api/emergency/duty-roster/current'] = 'emergency/current_duty_staff';

// Emergency Patient Transfers
$route['api/emergency/transfers'] = 'emergency/transfers';
$route['api/emergency/transfers/visit/(:num)'] = 'emergency/transfers/$1';

// Emergency Ambulance Requests
$route['api/emergency/ambulance-requests'] = 'emergency/ambulance_requests';
$route['api/emergency/ambulance-requests/(:num)/status'] = 'emergency/ambulance_request_status/$1';
$route['api/emergency/ambulance-requests/available'] = 'emergency/available_ambulances';

// Emergency Wards
$route['api/emergency/wards'] = 'emergency/wards';
$route['api/emergency/wards/(:num)'] = 'emergency/wards/$1';
$route['api/emergency/wards/(:num)/stats'] = 'emergency/ward_stats/$1';
$route['api/emergency/wards/(:num)/beds'] = 'emergency/ward_beds/$1';

// Emergency Ward Beds
$route['api/emergency/ward-beds'] = 'emergency/ward_beds_management';
$route['api/emergency/ward-beds/(:num)'] = 'emergency/ward_beds_management/$1';
$route['api/emergency/ward-beds/(:num)/assign'] = 'emergency/assign_bed/$1';
$route['api/emergency/ward-beds/(:num)/release'] = 'emergency/release_bed/$1';
$route['api/emergency/ward-beds/available'] = 'emergency/available_beds';

// Emergency Duty Roster
$route['api/emergency/duty-roster'] = 'emergency/duty_roster';
$route['api/emergency/duty-roster/(:num)'] = 'emergency/duty_roster/$1';
$route['api/emergency/duty-roster/date/(:any)'] = 'emergency/duty_roster_date/$1';
$route['api/emergency/duty-roster/current'] = 'emergency/current_duty_staff';

// Emergency Patient Transfers
$route['api/emergency/transfers'] = 'emergency/transfers';
$route['api/emergency/transfers/visit/(:num)'] = 'emergency/transfers/$1';

// Emergency Ambulance Requests
$route['api/emergency/ambulance-requests'] = 'emergency/ambulance_requests';
$route['api/emergency/ambulance-requests/(:num)'] = 'emergency/ambulance_requests/$1';
$route['api/emergency/ambulance-requests/(:num)/status'] = 'emergency/ambulance_request_status/$1';
$route['api/emergency/ambulance-requests/available'] = 'emergency/available_ambulances';

// Pharmacy Routes
// Stock Management
$route['api/pharmacy/stock'] = 'pharmacy_stock/index';
$route['api/pharmacy/stock/(:num)'] = 'pharmacy_stock/get/$1';
$route['api/pharmacy/stock/medicine/(:num)'] = 'pharmacy_stock/get_by_medicine/$1';
$route['api/pharmacy/stock/barcode/(:any)'] = 'pharmacy_stock/get_by_barcode/$1';
$route['api/pharmacy/stock/low-stock'] = 'pharmacy_stock/low_stock';
$route['api/pharmacy/stock/expiring'] = 'pharmacy_stock/expiring';
$route['api/pharmacy/stock/import'] = 'pharmacy_stock/import';
$route['api/pharmacy/stock/import-template'] = 'pharmacy_stock/import_template';
$route['api/pharmacy/stock/reserve'] = 'pharmacy_stock/reserve';
$route['api/pharmacy/stock/release'] = 'pharmacy_stock/release';
$route['api/pharmacy/stock/mark-expired'] = 'pharmacy_stock/mark_expired';
$route['api/pharmacy/stock/(:num)/mark-expired'] = 'pharmacy_stock/mark_expired/$1';

// Suppliers
$route['api/pharmacy/suppliers'] = 'suppliers/index';
$route['api/pharmacy/suppliers/(:num)'] = 'suppliers/id/$1';
$route['api/pharmacy/suppliers/(:num)/performance'] = 'suppliers/performance/$1';

// Purchase Orders
$route['api/pharmacy/purchase-orders'] = 'purchase_orders/index';
$route['api/pharmacy/purchase-orders/(:num)'] = 'purchase_orders/id/$1';
$route['api/pharmacy/purchase-orders/(:num)/approve'] = 'purchase_orders/approve/$1';
$route['api/pharmacy/purchase-orders/(:num)/cancel'] = 'purchase_orders/cancel/$1';
$route['api/pharmacy/purchase-orders/(:num)/receive'] = 'purchase_orders/receive/$1';

// Sales
$route['api/pharmacy/sales'] = 'pharmacy_sales/index';
$route['api/pharmacy/sales/voided'] = 'pharmacy_sales/voided';
$route['api/pharmacy/sales/summary'] = 'pharmacy_sales/summary';
$route['api/pharmacy/sales/top-selling'] = 'pharmacy_sales/top_selling';
$route['api/pharmacy/sales/(:num)/invoice'] = 'pharmacy_sales/invoice/$1';
$route['api/pharmacy/sales/(:num)/void'] = 'pharmacy_sales/void/$1';
$route['api/pharmacy/sales/(:any)'] = 'pharmacy_sales/get/$1';

// Refunds
$route['api/pharmacy/refunds'] = 'refunds/index';
$route['api/pharmacy/refunds/(:num)'] = 'refunds/id/$1';
$route['api/pharmacy/refunds/(:num)/complete'] = 'refunds/complete/$1';
$route['api/pharmacy/refunds/sale/(:num)'] = 'refunds/get_by_sale/$1';

// Reorder Management
$route['api/pharmacy/reorder'] = 'reorder/index';
$route['api/pharmacy/reorder/alerts'] = 'reorder/alerts';
$route['api/pharmacy/reorder/medicine/(:num)'] = 'reorder/medicine/$1';
$route['api/pharmacy/reorder/generate-pos'] = 'reorder/generate_pos';

// Medicine search with stock
$route['api/medicines/search-with-stock'] = 'medicines/search_with_stock';

// Stock Adjustments
$route['api/pharmacy/stock-adjustments'] = 'stock_adjustments/index';
$route['api/pharmacy/stock-adjustments/(:num)'] = 'stock_adjustments/get/$1';
$route['api/pharmacy/stock-adjustments/(:num)/approve'] = 'stock_adjustments/approve/$1';
$route['api/pharmacy/stock-adjustments/(:num)/reject'] = 'stock_adjustments/reject/$1';
$route['api/pharmacy/stock-adjustments/pending'] = 'stock_adjustments/pending';

// Stock Movements
$route['api/pharmacy/stock-movements'] = 'stock_movements/index';
$route['api/pharmacy/stock-movements/summary'] = 'stock_movements/summary';
$route['api/pharmacy/stock-movements/medicine/(:num)'] = 'stock_movements/medicine/$1';

// Barcodes
$route['api/pharmacy/barcodes'] = 'barcodes/index';
$route['api/pharmacy/barcodes/(:num)'] = 'barcodes/id/$1';
$route['api/pharmacy/barcodes/generate'] = 'barcodes/generate';

// Cash Drawers
$route['api/pharmacy/cash-drawers'] = 'cash_drawers/index';
$route['api/pharmacy/cash-drawers/(:num)'] = 'cash_drawers/get/$1';
$route['api/pharmacy/cash-drawers/(:num)/close'] = 'cash_drawers/close/$1';
$route['api/pharmacy/cash-drawers/(:num)/drop'] = 'cash_drawers/drop/$1';
$route['api/pharmacy/cash-drawers/open'] = 'cash_drawers/open_drawer';

// Shifts
$route['api/pharmacy/shifts'] = 'shifts/index';
$route['api/pharmacy/shifts/current'] = 'shifts/current';
$route['api/pharmacy/shifts/(:num)/close'] = 'shifts/close/$1';
$route['api/pharmacy/shifts/(:num)'] = 'shifts/get/$1';

// Price Overrides
$route['api/pharmacy/price-overrides'] = 'price_overrides/index';
$route['api/pharmacy/price-overrides/(:num)'] = 'price_overrides/get/$1';
$route['api/pharmacy/price-overrides/(:num)/approve'] = 'price_overrides/approve/$1';
$route['api/pharmacy/price-overrides/(:num)/reject'] = 'price_overrides/reject/$1';
$route['api/pharmacy/price-overrides/pending'] = 'price_overrides/pending';

// POS Settings
$route['api/pharmacy/pos-settings'] = 'pos_settings/index';
$route['api/pharmacy/pos-settings/category/(:any)'] = 'pos_settings/category/$1';
$route['api/pharmacy/pos-settings/(:any)'] = 'pos_settings/update_setting/$1';
$route['api/pharmacy/pos-settings/reset'] = 'pos_settings/reset';

// GST Rates
$route['api/pharmacy/gst-rates'] = 'gst_rates/index';
$route['api/pharmacy/gst-rates/active'] = 'gst_rates/active';
$route['api/pharmacy/gst-rates/default'] = 'gst_rates/default_rate';
$route['api/pharmacy/gst-rates/(:num)'] = 'gst_rates/get/$1';
$route['api/pharmacy/gst-rates/(:num)/set-default'] = 'gst_rates/set_default/$1';

// Expenses
$route['api/pharmacy/expenses'] = 'expenses/index';
$route['api/pharmacy/expenses/summary'] = 'expenses/summary';
$route['api/pharmacy/expenses/(:num)'] = 'expenses/id/$1';

// Expense Categories
$route['api/pharmacy/expense-categories'] = 'expense_categories/index';
$route['api/pharmacy/expense-categories/(:num)'] = 'expense_categories/id/$1';

// User Management Routes
$route['api/users'] = 'users/index';
$route['api/users/(:num)/settings'] = 'users/settings/$1'; // Must be before generic (:num) route
$route['api/users/(:num)/permissions'] = 'users/permissions/$1';
$route['api/users/(:num)'] = 'users/get/$1';
$route['api/users/permissions/definitions'] = 'users/permission_definitions';
$route['api/users/permissions/role-mappings'] = 'users/role_mappings';
$route['api/users/roles'] = 'users/roles';
$route['api/users/roles/(:any)/permissions'] = 'users/role_permissions/$1';

// Setup Module Routes - Floors
$route['api/floors'] = 'floors/index';
$route['api/floors/buildings'] = 'floors/buildings';
$route['api/floors/(:num)'] = 'floors/get/$1';

// Setup Module Routes - Rooms
$route['api/rooms'] = 'rooms/index';
$route['api/rooms/types'] = 'rooms/types';
$route['api/rooms/(:num)'] = 'rooms/get/$1';

// Setup Module Routes - Receptions
$route['api/receptions'] = 'receptions/index';
$route['api/receptions/(:num)'] = 'receptions/get/$1';

// Setup Module Routes - Departments
$route['api/departments'] = 'departments/index';
$route['api/departments/types'] = 'departments/types';
$route['api/departments/(:num)'] = 'departments/get/$1';

// Setup Module Routes - Referral Hospitals
$route['api/referral-hospitals/types'] = 'referralhospitals/types'; // Specific route first
$route['api/referral-hospitals'] = 'referralhospitals/index';
$route['api/referral-hospitals/(:num)'] = 'referralhospitals/get/$1';

// Setup Module Routes - Insurance Organizations
$route['api/insurance-organizations/pricing-items'] = 'insuranceorganizations/pricing_items'; // Specific route first
$route['api/insurance-organizations/(:num)/pricing'] = 'insuranceorganizations/pricing/$1'; // Specific route before generic
$route['api/insurance-organizations'] = 'insuranceorganizations/index';
$route['api/insurance-organizations/(:num)'] = 'insuranceorganizations/get/$1';

// Setup Module Routes - Donation Donors
$route['api/donation-donors/(:num)/payments'] = 'donationdonors/payments/$1'; // Specific route before generic
$route['api/donation-donors'] = 'donationdonors/index';
$route['api/donation-donors/(:num)'] = 'donationdonors/get/$1';

// Priority Modules Routes
$route['api/modules'] = 'prioritymodules/index';
$route['api/priority-modules'] = 'prioritymodules/get_priority_modules';
$route['api/priority-modules/(:any)'] = 'prioritymodules/delete_priority_module/$1';

// Billing Routes - Organizations
$route['api/organizations/current'] = 'organizations/current';
$route['api/organizations'] = 'organizations/index';
$route['api/organizations/(:num)'] = 'organizations/get/$1';

// Billing Routes - Subscription Plans
$route['api/subscription-plans'] = 'subscriptionplans/index';
$route['api/subscription-plans/(:num)'] = 'subscriptionplans/get/$1';

// Billing Routes - Invoices
$route['api/invoices/overdue'] = 'invoices/overdue';
$route['api/invoices/(:num)/send'] = 'invoices/send/$1';
$route['api/invoices'] = 'invoices/index';
$route['api/invoices/(:num)'] = 'invoices/get/$1';

// Billing Routes - Payments
$route['api/payments/invoice/(:num)'] = 'payments/invoice/$1';
$route['api/payments'] = 'payments/index';
$route['api/payments/(:num)'] = 'payments/get/$1';

// Billing Routes - Billing Settings
$route['api/billing-settings'] = 'billingsettings/get';
$route['api/billing-settings/(:num)'] = 'billingsettings/get/$1';

// System Settings Routes (order matters - more specific routes first)
$route['api/system-settings/room-mode'] = 'system_settings/room_mode';
$route['api/system-settings/category/(:any)'] = 'system_settings/category/$1';
$route['api/system-settings'] = 'system_settings/index';
$route['api/system-settings/(:any)'] = 'system_settings/get/$1';

// Doctor Rooms Routes (Fixed Mode)
$route['api/doctor-rooms'] = 'doctor_rooms/index';
$route['api/doctor-rooms/doctor/(:num)'] = 'doctor_rooms/doctor/$1';
$route['api/doctor-rooms/(:num)'] = 'doctor_rooms/get/$1';

// Doctor Slot Rooms Routes (Dynamic Mode)
$route['api/doctor-slot-rooms'] = 'doctor_slot_rooms/index';
$route['api/doctor-slot-rooms/bulk'] = 'doctor_slot_rooms/bulk';
$route['api/doctor-slot-rooms/doctor/(:num)/date/(:any)'] = 'doctor_slot_rooms/doctor/$1/$2';
$route['api/doctor-slot-rooms/(:num)'] = 'doctor_slot_rooms/get/$1';

// Tokens Routes
$route['api/tokens/reception/(:num)'] = 'tokens/reception/$1';
$route['api/tokens/floor/(:num)'] = 'tokens/floor/$1';
$route['api/tokens/doctor/(:num)'] = 'tokens/doctor/$1';
$route['api/tokens/queue/(:num)'] = 'tokens/queue/$1';
$route['api/tokens/(:num)/status'] = 'tokens/update_status/$1';
$route['api/tokens/(:num)'] = 'tokens/get/$1';

// Reports
$route['api/pharmacy/reports/sales-summary'] = 'pharmacy_reports/sales_summary';
$route['api/pharmacy/reports/daily-sales'] = 'pharmacy_reports/daily_sales';
$route['api/pharmacy/reports/payment-method'] = 'pharmacy_reports/payment_method';
$route['api/pharmacy/reports/top-selling'] = 'pharmacy_reports/top_selling';
$route['api/pharmacy/reports/cashier-performance'] = 'pharmacy_reports/cashier_performance';
$route['api/pharmacy/reports/shift-summary'] = 'pharmacy_reports/shift_summary';

// Message Settings Routes
// Message Templates
$route['api/message-templates'] = 'message_templates/index';
$route['api/message-templates/(:num)'] = 'message_templates/get/$1';
$route['api/message-templates/(:num)/duplicate'] = 'message_templates/duplicate/$1';
$route['api/message-templates/(:num)/toggle-status'] = 'message_templates/toggle_status/$1';
$route['api/message-templates/(:num)/test'] = 'message_templates/test/$1';

// Message Platforms
$route['api/message-platforms'] = 'message_platforms/index';
$route['api/message-platforms/(:any)'] = 'message_platforms/get/$1';

// Message Recipients
$route['api/message-recipients'] = 'message_recipients/index';
$route['api/message-recipients/doctors'] = 'message_recipients/doctors';
$route['api/message-recipients/staff'] = 'message_recipients/staff';
$route['api/message-recipients/admins'] = 'message_recipients/admins';
$route['api/message-recipients/bulk'] = 'message_recipients/bulk';
$route['api/message-recipients/(:num)'] = 'message_recipients/get/$1';

// Message Statistics
$route['api/message-statistics'] = 'message_statistics/index';
$route['api/message-statistics/daily'] = 'message_statistics/daily';
$route['api/message-statistics/weekly'] = 'message_statistics/weekly';
$route['api/message-statistics/by-platform'] = 'message_statistics/by_platform';

// Laboratory Routes
$route['api/laboratory/dashboard'] = 'laboratory/dashboard';
$route['api/laboratory/orders'] = 'laboratory/orders';
$route['api/laboratory/orders/(:num)'] = 'laboratory/get_order/$1';
$route['api/laboratory/orders/(:num)/status'] = 'laboratory/update_order_status/$1';
$route['api/laboratory/orders/(:num)/billing'] = 'lab_billing/create_billing/$1';
$route['api/laboratory/samples'] = 'laboratory/samples';
$route['api/laboratory/samples/(:any)'] = 'laboratory/get_sample/$1'; // by barcode
$route['api/laboratory/results'] = 'laboratory/results';
$route['api/laboratory/results/(:num)'] = 'laboratory/get_result/$1';
$route['api/laboratory/results/(:num)/verify'] = 'laboratory/verify_result/$1';
$route['api/laboratory/results/(:num)/approve'] = 'laboratory/approve_result/$1';
$route['api/laboratory/reports/(:num)'] = 'laboratory/generate_report/$1';
$route['api/laboratory/billing/(:num)'] = 'lab_billing/get/$1';
$route['api/laboratory/billing/(:num)/payment'] = 'lab_billing/payment/$1';

// OPD Billing Routes
$route['api/opd-billing'] = 'OpdBilling/index';
$route['api/opd-billing/(:num)'] = 'OpdBilling/get/$1';
$route['api/opd-billing/bill-number/(:any)'] = 'OpdBilling/bill_number/$1';
$route['api/opd-billing/patient/(:num)'] = 'OpdBilling/patient/$1';
$route['api/opd-billing/appointment/(:num)'] = 'OpdBilling/appointment/$1';
$route['api/opd-billing/payment/(:num)'] = 'OpdBilling/payment/$1';
$route['api/opd-billing/update-status/(:num)'] = 'OpdBilling/update_status/$1';

// Patient Payments Routes
$route['api/patient-payments'] = 'PatientPayments/index';
$route['api/patient-payments/(:num)'] = 'PatientPayments/index/$1';
$route['api/patient-payments/bill-payment'] = 'PatientPayments/bill_payment';
$route['api/patient-payments/advance'] = 'PatientPayments/advance';
$route['api/patient-payments/history/(:num)'] = 'PatientPayments/history/$1';
$route['api/patient-payments/bill/(:any)/(:num)'] = 'PatientPayments/bill/$1/$2';
$route['api/patient-payments/advance-balance/(:num)'] = 'PatientPayments/advance_balance/$1';
$route['api/patient-payments/apply-advance'] = 'PatientPayments/apply_advance';
$route['api/patient-payments/refund/(:num)'] = 'PatientPayments/refund/$1';
$route['api/patient-payments/generate-receipt/(:num)'] = 'PatientPayments/generate_receipt/$1';
$route['api/patient-payments/receipt/(:any)'] = 'PatientPayments/receipt/$1';

// IPD Management Routes
// Dashboard
$route['api/ipd/dashboard'] = 'ipd/dashboard';

// Hospital Dashboard
$route['api/dashboard/overview'] = 'dashboard/overview';
$route['api/dashboard/patient-trends'] = 'dashboard/patient_trends';
$route['api/dashboard/revenue-trends'] = 'dashboard/revenue_trends';
$route['api/dashboard/department-stats'] = 'dashboard/department_stats';
$route['api/dashboard/recent-activities'] = 'dashboard/recent_activities';
$route['api/dashboard/upcoming-appointments'] = 'dashboard/upcoming_appointments';
$route['api/dashboard/alerts'] = 'dashboard/alerts';
$route['api/dashboard/evaluation'] = 'dashboard/evaluation';
$route['api/ipd/stats'] = 'ipd/stats';

// Admissions
$route['api/ipd/admissions'] = 'ipd/admissions';
$route['api/ipd/admissions/(:num)'] = 'ipd/admissions/$1';
$route['api/ipd/admissions/(:num)/vitals'] = 'ipd/vitals/$1';
$route['api/ipd/admissions/(:num)/orders'] = 'ipd/orders/$1';
$route['api/ipd/admissions/(:num)/nursing-notes'] = 'ipd/nursing_notes/$1';
$route['api/ipd/admissions/(:num)/billing'] = 'ipd/billing/$1';
$route['api/ipd/admissions/(:num)/billing/payment'] = 'ipd/billing_payment/$1';
$route['api/ipd/admissions/(:num)/discharge'] = 'ipd/discharge/$1';
$route['api/ipd/discharges'] = 'ipd/discharges';
$route['api/ipd/admissions/(:num)/transfer'] = 'ipd/transfer/$1';
$route['api/ipd/admissions/(:num)/transfers'] = 'ipd/transfer/$1';
$route['api/ipd/admissions/(:num)/daily-care-orders'] = 'ipd/daily_care_orders/$1';
$route['api/ipd/admissions/(:num)/medications'] = 'ipd/medications/$1';
$route['api/ipd/admissions/(:num)/lab-orders'] = 'ipd/lab_orders/$1';
$route['api/ipd/admissions/(:num)/radiology-orders'] = 'ipd/radiology_orders/$1';
$route['api/ipd/admissions/(:num)/doctor-notes'] = 'ipd/doctor_notes/$1';
$route['api/ipd/admissions/(:num)/pharmacist-notes'] = 'ipd/pharmacist_notes/$1';
$route['api/ipd/admissions/(:num)/procedures'] = 'ipd/procedures/$1';
$route['api/ipd/admissions/(:num)/nutrition'] = 'ipd/nutrition/$1';
$route['api/ipd/admissions/(:num)/intake-output'] = 'ipd/intake_output/$1';
$route['api/ipd/admissions/(:num)/health-physical-habits'] = 'ipd/health_physical_habits/$1';
$route['api/ipd/admissions/(:num)/forms'] = 'ipd/forms/$1';
$route['api/ipd/admissions/(:num)/doctor-recommendations'] = 'ipd/doctor_recommendations/$1';
$route['api/ipd/admissions/(:num)/doctor-consultations'] = 'ipd/doctor_consultations/$1';
$route['api/ipd/admissions/(:num)/files'] = 'ipd/files/$1';

// Standalone update/delete routes
$route['api/ipd/vitals/(:num)'] = 'ipd/vitals_update/$1';
$route['api/ipd/daily-care-orders/(:num)'] = 'ipd/daily_care_orders_update/$1';
$route['api/ipd/medications/(:num)'] = 'ipd/medications_update/$1';
$route['api/ipd/lab-orders/(:num)'] = 'ipd/lab_orders_update/$1';
$route['api/ipd/radiology-orders/(:num)'] = 'ipd/radiology_orders_update/$1';
$route['api/ipd/doctor-notes/(:num)'] = 'ipd/doctor_notes_update/$1';
$route['api/ipd/pharmacist-notes/(:num)'] = 'ipd/pharmacist_notes_update/$1';
$route['api/ipd/procedures/(:num)'] = 'ipd/procedures_update/$1';
// OT Schedules
$route['api/ipd/ot-schedules'] = 'ipd/ot_schedules';
$route['api/ipd/ot-schedules/(:num)'] = 'ipd/ot_schedules/$1';
$route['api/ipd/ot-schedules/(:num)/start'] = 'ipd/ot_schedule_start/$1';
$route['api/ipd/ot-schedules/(:num)/complete'] = 'ipd/ot_schedule_complete/$1';
$route['api/ipd/ot-schedules/(:num)/cancel'] = 'ipd/ot_schedule_cancel/$1';
$route['api/ipd/ot-schedules/(:num)/pre-op-checklist'] = 'ipd/pre_op_checklist/$1';
$route['api/ipd/ot-availability'] = 'ipd/ot_availability';
$route['api/ipd/operation-theatres'] = 'ipd/operation_theatres';
$route['api/ipd/surgeries/(:num)/charges'] = 'ipd/surgery_charges/$1';
$route['api/ipd/surgeries/(:num)/consumables'] = 'ipd/surgery_consumables/$1';
$route['api/ipd/surgeries/(:num)/consumables/(:num)'] = 'ipd/surgery_consumables/$1/$2';
$route['api/ipd/nutrition/(:num)'] = 'ipd/nutrition_update/$1';
$route['api/ipd/intake-output/(:num)'] = 'ipd/intake_output_update/$1';
$route['api/ipd/health-physical-habits/(:num)'] = 'ipd/health_physical_habits_update/$1';
$route['api/ipd/forms/(:num)'] = 'ipd/forms_update/$1';
$route['api/ipd/doctor-recommendations/(:num)'] = 'ipd/doctor_recommendations_update/$1';
$route['api/ipd/doctor-consultations/(:num)'] = 'ipd/doctor_consultations_update/$1';
$route['api/ipd/files/(:num)'] = 'ipd/files_update/$1';

// Wards
$route['api/ipd/wards'] = 'ipd/wards';
$route['api/ipd/wards/(:num)'] = 'ipd/wards/$1';
$route['api/ipd/wards/(:num)/beds'] = 'ipd/ward_beds/$1';

// Beds
$route['api/ipd/beds'] = 'ipd/beds';
$route['api/ipd/beds/(:num)'] = 'ipd/beds/$1';
$route['api/ipd/beds/available'] = 'ipd/available_beds';

// Rooms
$route['api/ipd/rooms'] = 'ipd/rooms';
$route['api/ipd/rooms/(:num)'] = 'ipd/rooms/$1';
$route['api/ipd/rooms/available'] = 'ipd/available_rooms';

// Duty Roster
$route['api/ipd/duty-roster'] = 'ipd/duty_roster';
$route['api/ipd/duty-roster/(:num)'] = 'ipd/duty_roster/$1';

// Rehabilitation Requests
$route['api/ipd/rehabilitation-requests'] = 'ipd/rehabilitation_requests';
$route['api/ipd/rehabilitation-requests/(:num)'] = 'ipd/rehabilitation_requests/$1';

// Admission Requests (from doctors)
$route['api/ipd/admission-requests'] = 'ipd/admission_requests';
$route['api/ipd/admission-requests/(:num)'] = 'ipd/admission_requests/$1';
$route['api/ipd/admission-requests/(:num)/approve'] = 'ipd/approve_admission_request/$1';
$route['api/ipd/admission-requests/(:num)/reject'] = 'ipd/reject_admission_request/$1';

// IPD Reports Routes
$route['api/ipd/reports/daily-admissions'] = 'ipd_reports/daily_admissions';
$route['api/ipd/reports/daily-discharges'] = 'ipd_reports/daily_discharges';
$route['api/ipd/reports/alos'] = 'ipd_reports/alos';
$route['api/ipd/reports/transfers'] = 'ipd_reports/transfers';
$route['api/ipd/reports/bed-occupancy'] = 'ipd_reports/bed_occupancy';
$route['api/ipd/reports/bed-turnover'] = 'ipd_reports/bed_turnover';
$route['api/ipd/reports/census'] = 'ipd_reports/census';
$route['api/ipd/reports/revenue'] = 'ipd_reports/revenue';
$route['api/ipd/reports/consultant-revenue'] = 'ipd_reports/consultant_revenue';
$route['api/ipd/reports/billing-summary'] = 'ipd_reports/billing_summary';
$route['api/ipd/reports/advance-received'] = 'ipd_reports/advance_received';
$route['api/ipd/reports/pending-bills'] = 'ipd_reports/pending_bills';
$route['api/ipd/reports/bill-comparison'] = 'ipd_reports/bill_comparison';
$route['api/ipd/reports/panel-billing'] = 'ipd_reports/panel_billing';
$route['api/ipd/reports/diagnosis-wise'] = 'ipd_reports/diagnosis_wise';
$route['api/ipd/reports/procedure-wise'] = 'ipd_reports/procedure_wise';
$route['api/ipd/reports/doctor-patient-load'] = 'ipd_reports/doctor_patient_load';
$route['api/ipd/reports/medication-chart'] = 'ipd_reports/medication_chart';
$route['api/ipd/reports/vital-monitoring'] = 'ipd_reports/vital_monitoring';
$route['api/ipd/reports/nursing-care'] = 'ipd_reports/nursing_care';
$route['api/ipd/reports/realtime-occupancy'] = 'ipd_reports/realtime_occupancy';
$route['api/ipd/reports/ward-saturation'] = 'ipd_reports/ward_saturation';
$route['api/ipd/reports/room-type-usage'] = 'ipd_reports/room_type_usage';
$route['api/ipd/reports/bed-allocation'] = 'ipd_reports/bed_allocation';
$route['api/ipd/reports/bed-blocking'] = 'ipd_reports/bed_blocking';
$route['api/ipd/reports/medication-consumption'] = 'ipd_reports/medication_consumption';
$route['api/ipd/reports/lab-utilization'] = 'ipd_reports/lab_utilization';
$route['api/ipd/reports/delayed-lab-reports'] = 'ipd_reports/delayed_lab_reports';
$route['api/ipd/reports/critical-lab-results'] = 'ipd_reports/critical_lab_results';
$route['api/ipd/reports/radiology-usage'] = 'ipd_reports/radiology_usage';
$route['api/ipd/reports/panel-admissions'] = 'ipd_reports/panel_admissions';
$route['api/ipd/reports/panel-billing-summary'] = 'ipd_reports/panel_billing_summary';
$route['api/ipd/reports/claim-status'] = 'ipd_reports/claim_status';
$route['api/ipd/reports/pre-auth-comparison'] = 'ipd_reports/pre_auth_comparison';

// Birth Certificates
$route['api/birth-certificates'] = 'birth_certificates/index';
$route['api/birth-certificates/(:num)'] = 'birth_certificates/index/$1';

// Death Certificates
$route['api/death-certificates'] = 'death_certificates/index';
$route['api/death-certificates/(:num)'] = 'death_certificates/index/$1';

// Software Team Contacts
$route['api/software_team_contacts/departments'] = 'software_team_contacts/departments';
$route['api/software_team_contacts/(:num)'] = 'software_team_contacts/index/$1';
$route['api/software_team_contacts'] = 'software_team_contacts/index';
// Also support dashes for backward compatibility
$route['api/software-team-contacts/departments'] = 'software_team_contacts/departments';
$route['api/software-team-contacts/(:num)'] = 'software_team_contacts/index/$1';
$route['api/software-team-contacts'] = 'software_team_contacts/index';

// Support Tickets
$route['api/support-tickets/stats'] = 'support_tickets/stats';
$route['api/support-tickets/(:num)/attachments/(:num)'] = 'support_tickets/attachments/$1/$2';
$route['api/support-tickets/(:num)/attachments'] = 'support_tickets/attachments/$1';
$route['api/support-tickets/(:num)/comments/(:num)'] = 'support_tickets/comments/$1/$2';
$route['api/support-tickets/(:num)/comments'] = 'support_tickets/comments/$1';
$route['api/support-tickets/(:num)'] = 'support_tickets/index/$1';
$route['api/support-tickets'] = 'support_tickets/index';

// Audit Logs
$route['api/audit-logs/export'] = 'audit_logs/export';
$route['api/audit-logs/statistics'] = 'audit_logs/statistics';
$route['api/audit-logs/modules'] = 'audit_logs/modules';
$route['api/audit-logs/users-list'] = 'audit_logs/users_list';
$route['api/audit-logs/users/(:num)'] = 'audit_logs/users/$1';
$route['api/audit-logs/(:num)'] = 'audit_logs/index/$1';
$route['api/audit-logs'] = 'audit_logs/index';
