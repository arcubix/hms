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
$route['api/emergency/stats'] = 'emergency/stats';
$route['api/emergency/beds'] = 'emergency/beds';

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
