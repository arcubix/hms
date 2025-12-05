<?php
defined('BASEPATH') OR exit('No direct script access allowed');

// Load the base Api controller
require_once(APPPATH . 'controllers/Api.php');

/**
 * Priority Modules API Controller
 * Handles fetching and saving user priority modules
 */
class PriorityModules extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Modules_model');
        $this->load->model('User_model');
    }

    /**
     * Get all available modules
     * GET /api/modules
     */
    public function index() {
        // No authentication required for getting module list (public info)
        // But we can optionally require it if needed
        
        try {
            $modules = $this->Modules_model->get_all_modules();
            
            // Format response
            $formatted_modules = array();
            foreach ($modules as $module) {
                $formatted_modules[] = array(
                    'module_id' => $module['module_id'],
                    'label' => $module['label'],
                    'description' => $module['description'],
                    'category' => $module['category'],
                    'icon_name' => $module['icon_name'],
                    'color_from' => $module['color_from'],
                    'color_to' => $module['color_to'],
                    'is_active' => (bool)$module['is_active'],
                    'display_order' => (int)$module['display_order']
                );
            }
            
            $this->success($formatted_modules, 'Modules retrieved successfully');
        } catch (Exception $e) {
            log_message('error', 'Error fetching modules: ' . $e->getMessage());
            $this->error('Failed to fetch modules', 500);
        }
    }

    /**
     * Handle priority modules requests
     * GET /api/priority-modules - Get user's priority modules
     * POST /api/priority-modules - Save user's priority modules
     */
    public function get_priority_modules() {
        if (!$this->verify_token()) {
            return;
        }
        
        // Check HTTP method
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'POST') {
            // Save priority modules
            $this->save_priority_modules();
            return;
        }
        
        // GET - Return priority modules
        try {
            $user_id = $this->user['id'];
            $priority_modules = $this->User_model->get_user_priority_modules($user_id);
            
            // Format response
            $formatted_modules = array();
            foreach ($priority_modules as $module) {
                $formatted_modules[] = array(
                    'module_id' => $module['module_id'],
                    'label' => $module['label'],
                    'description' => $module['description'],
                    'category' => $module['category'],
                    'icon_name' => $module['icon_name'],
                    'color_from' => $module['color_from'],
                    'color_to' => $module['color_to'],
                    'is_active' => (bool)$module['is_active'],
                    'display_order' => (int)$module['display_order'],
                    'position' => (int)$module['position']
                );
            }
            
            $this->success($formatted_modules, 'Priority modules retrieved successfully');
        } catch (Exception $e) {
            log_message('error', 'Error fetching priority modules: ' . $e->getMessage());
            $this->error('Failed to fetch priority modules', 500);
        }
    }

    /**
     * Save user's priority modules
     * POST /api/priority-modules
     */
    public function save_priority_modules() {
        if (!$this->verify_token()) {
            return;
        }
        
        try {
            $data = $this->get_request_data();
            
            // Validate input
            if (!isset($data['modules']) || !is_array($data['modules'])) {
                $this->error('Modules array is required', 422);
                return;
            }
            
            $module_ids = $data['modules'];
            
            // Validate module IDs are strings
            foreach ($module_ids as $module_id) {
                if (!is_string($module_id)) {
                    $this->error('All module IDs must be strings', 422);
                    return;
                }
            }
            
            // Validate maximum 7 modules
            if (count($module_ids) > 7) {
                $this->error('Maximum 7 priority modules allowed', 422);
                return;
            }
            
            // Validate minimum 1 module
            if (count($module_ids) < 1) {
                $this->error('At least 1 priority module is required', 422);
                return;
            }
            
            // Validate module IDs exist
            $valid_module_ids = $this->Modules_model->validate_module_ids($module_ids);
            if (count($valid_module_ids) !== count($module_ids)) {
                $invalid_ids = array_diff($module_ids, $valid_module_ids);
                $this->error('Invalid module IDs: ' . implode(', ', $invalid_ids), 422);
                return;
            }
            
            // Save priority modules
            $user_id = $this->user['id'];
            $success = $this->User_model->save_user_priority_modules($user_id, $module_ids);
            
            if (!$success) {
                $this->error('Failed to save priority modules', 500);
                return;
            }
            
            // Return updated priority modules
            $priority_modules = $this->User_model->get_user_priority_modules($user_id);
            
            // Format response
            $formatted_modules = array();
            foreach ($priority_modules as $module) {
                $formatted_modules[] = array(
                    'module_id' => $module['module_id'],
                    'label' => $module['label'],
                    'description' => $module['description'],
                    'category' => $module['category'],
                    'icon_name' => $module['icon_name'],
                    'color_from' => $module['color_from'],
                    'color_to' => $module['color_to'],
                    'is_active' => (bool)$module['is_active'],
                    'display_order' => (int)$module['display_order'],
                    'position' => (int)$module['position']
                );
            }
            
            $this->success($formatted_modules, 'Priority modules saved successfully');
        } catch (Exception $e) {
            log_message('error', 'Error saving priority modules: ' . $e->getMessage());
            $this->error('Failed to save priority modules: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete a priority module for user
     * DELETE /api/priority-modules/:module_id
     */
    public function delete_priority_module($module_id = null) {
        if (!$this->verify_token()) {
            return;
        }
        
        if (!$module_id) {
            $this->error('Module ID is required', 422);
            return;
        }
        
        try {
            $user_id = $this->user['id'];
            
            // Check if user has this module
            $priority_modules = $this->User_model->get_user_priority_module_ids($user_id);
            if (!in_array($module_id, $priority_modules)) {
                $this->error('Module not found in priority list', 404);
                return;
            }
            
            // Delete the module
            $success = $this->User_model->delete_user_priority_modules($user_id, $module_id);
            
            if (!$success) {
                $this->error('Failed to delete priority module', 500);
                return;
            }
            
            // Return updated priority modules
            $updated_modules = $this->User_model->get_user_priority_modules($user_id);
            
            // Format response
            $formatted_modules = array();
            foreach ($updated_modules as $module) {
                $formatted_modules[] = array(
                    'module_id' => $module['module_id'],
                    'label' => $module['label'],
                    'description' => $module['description'],
                    'category' => $module['category'],
                    'icon_name' => $module['icon_name'],
                    'color_from' => $module['color_from'],
                    'color_to' => $module['color_to'],
                    'is_active' => (bool)$module['is_active'],
                    'display_order' => (int)$module['display_order'],
                    'position' => (int)$module['position']
                );
            }
            
            $this->success($formatted_modules, 'Priority module deleted successfully');
        } catch (Exception $e) {
            log_message('error', 'Error deleting priority module: ' . $e->getMessage());
            $this->error('Failed to delete priority module: ' . $e->getMessage(), 500);
        }
    }
}

