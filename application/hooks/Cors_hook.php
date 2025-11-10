<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * CORS Hook
 * 
 * Handles Cross-Origin Resource Sharing (CORS) headers
 * Based on the recommended CodeIgniter 3 approach
 */
class Cors_hook {

    public function enableCors() {
        // Set CORS headers for all requests
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE, PATCH");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
        header("Access-Control-Max-Age: 3600");
        
        // Handle preflight (OPTIONS) requests
        if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
            http_response_code(200);
            header("Content-Length: 0");
            header("Content-Type: text/plain");
            exit(0);
        }
    }
}
