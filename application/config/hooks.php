<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/*
| -------------------------------------------------------------------------
| Hooks
| -------------------------------------------------------------------------
| This file lets you define "hooks" to extend CI without hacking the core
| files.  Please see the user guide for info:
|
|	https://codeigniter.com/userguide3/general/hooks.html
|
*/

// Handle CORS at pre_system (EARLIEST possible - before CodeIgniter loads)
// This ensures OPTIONS requests are handled before any CodeIgniter initialization
$hook['pre_system'] = array(
    array(
        'class'    => 'Cors_hook',
        'function' => 'enableCors',
        'filename' => 'Cors_hook.php',
        'filepath' => 'hooks'
    )
);

// Also handle at post_controller_constructor as recommended
$hook['post_controller_constructor'] = array(
    array(
        'class'    => 'Cors_hook',
        'function' => 'enableCors',
        'filename' => 'Cors_hook.php',
        'filepath' => 'hooks'
    )
);
$hook['post_controller'] = array();
$hook['display_override'] = array();
$hook['cache_override'] = array();
$hook['post_system'] = array();
