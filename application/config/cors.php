<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/*
|--------------------------------------------------------------------------
| CORS Configuration
|--------------------------------------------------------------------------
|
| Configure Cross-Origin Resource Sharing (CORS) settings for API
|
*/

// Allowed origins (add your frontend URL)
$config['allowed_origins'] = array(
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
);

// Allowed HTTP methods
$config['allowed_methods'] = array('GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH');

// Allowed headers
$config['allowed_headers'] = array(
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
);

// Allow credentials (cookies, authorization headers)
$config['allow_credentials'] = true;

// Max age for preflight requests (in seconds)
$config['max_age'] = 3600;

// Exposed headers
$config['exposed_headers'] = array();

