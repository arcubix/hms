<?php
defined('BASEPATH') OR exit('No direct script access allowed');

// Load the base Api controller
require_once(APPPATH . 'controllers/Api.php');

/**
 * Test Controller - For debugging API
 */
class Test extends Api {

    public function __construct() {
        parent::__construct();
    }

    public function index() {
        $response = array(
            'message' => 'API is working!',
            'timestamp' => date('Y-m-d H:i:s'),
            'php_version' => PHP_VERSION
        );
        
        // Test database connection
        try {
            $this->load->database();
            $db_error = $this->db->error();
            if ($db_error['code'] != 0) {
                $response['database'] = array(
                    'connected' => false,
                    'error' => $db_error['message']
                );
            } else {
                $response['database'] = array(
                    'connected' => true,
                    'database' => $this->db->database
                );
                
                // Check if users table exists
                try {
                    $tables = $this->db->list_tables();
                    $response['tables'] = $tables;
                    $response['users_table_exists'] = in_array('users', $tables);
                } catch (Exception $e) {
                    $response['tables_error'] = $e->getMessage();
                }
            }
        } catch (Exception $e) {
            $response['database'] = array(
                'connected' => false,
                'error' => $e->getMessage()
            );
        }
        
        // Use the success method from Api controller for consistent response
        $this->success($response);
    }
}

