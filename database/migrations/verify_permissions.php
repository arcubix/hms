<?php
/**
 * Verification Script: Check Permission Consolidation Status
 */

$base_path = dirname(dirname(dirname(__FILE__)));
require_once $base_path . '/index.php';

$CI =& get_instance();
$CI->load->database();
$db = $CI->db;

echo "========================================\n";
echo "Permission Consolidation Verification\n";
echo "========================================\n\n";

// Check consolidated permissions
echo "1. Checking consolidated permissions:\n";
$consolidated = array('view_patient_profiles', 'add_patient', 'edit_patient', 'delete_patient', 
                      'create_invoice', 'edit_invoice', 'add_appointment', 'delete_token_appointment',
                      'view_all_patients', 'search_patients', 'emergency_consultant');
$db->where_in('permission_key', $consolidated);
$query = $db->get('permission_definitions');
$perms = $query->result();
echo "   Found " . count($perms) . " consolidated permissions\n\n";

// Check old role-prefixed permissions
echo "2. Checking old role-prefixed permissions:\n";
$old_patterns = array('doctor.view_patient_profiles', 'staff.view_patient_profiles', 
                      'doctor.add_appointment', 'staff.add_appointment',
                      'doctor.delete_patient', 'admin.delete_patient');
$db->where_in('permission_key', $old_patterns);
$query = $db->get('permission_definitions');
$old_perms = $query->result();
echo "   Found " . count($old_perms) . " old role-prefixed permissions\n";
if (count($old_perms) > 0) {
    echo "   Old permissions still exist:\n";
    foreach ($old_perms as $perm) {
        echo "     - {$perm->permission_key}\n";
    }
}
echo "\n";

// Check role permissions for consolidated permissions
echo "3. Checking role permissions for consolidated permissions:\n";
$db->select('pd.permission_key, COUNT(DISTINCT rp.role) as role_count');
$db->from('role_permissions rp');
$db->join('permission_definitions pd', 'rp.permission_id = pd.id', 'inner');
$db->where_in('pd.permission_key', $consolidated);
$db->group_by('pd.permission_key');
$query = $db->get();
$role_perms = $query->result();
foreach ($role_perms as $rp) {
    echo "   {$rp->permission_key}: {$rp->role_count} role(s)\n";
}
echo "\n";

// Check role permissions for old permissions
echo "4. Checking role permissions for old role-prefixed permissions:\n";
$db->select('pd.permission_key, COUNT(DISTINCT rp.role) as role_count');
$db->from('role_permissions rp');
$db->join('permission_definitions pd', 'rp.permission_id = pd.id', 'inner');
$db->where_in('pd.permission_key', $old_patterns);
$db->group_by('pd.permission_key');
$query = $db->get();
$old_role_perms = $query->result();
if (count($old_role_perms) > 0) {
    foreach ($old_role_perms as $rp) {
        echo "   {$rp->permission_key}: {$rp->role_count} role(s) - NEEDS MIGRATION\n";
    }
} else {
    echo "   No old role-prefixed permissions found in role_permissions table\n";
}
echo "\n";

echo "========================================\n";
echo "Verification Complete\n";
echo "========================================\n";

