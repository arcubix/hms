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
