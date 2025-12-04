# API Route Fix - User Settings Endpoint

## 🔴 **Problem**
404 error when accessing: `PUT http://localhost/hms/index.php/api/users/1/settings`

## ✅ **Solution**
Added missing route in `application/config/routes.php`

## 📝 **Changes Made**

### **File:** `application/config/routes.php`

**Added route (line 269):**
```php
$route['api/users/(:num)/settings'] = 'users/settings/$1';
```

**Important:** This route was placed **before** the generic `$route['api/users/(:num)']` route because CodeIgniter matches routes in order, and more specific routes must come first.

### **Route Order:**
```php
// User Management Routes
$route['api/users'] = 'users/index';
$route['api/users/(:num)/settings'] = 'users/settings/$1'; // ✅ NEW - Must be before generic route
$route['api/users/(:num)/permissions'] = 'users/permissions/$1';
$route['api/users/(:num)'] = 'users/get/$1'; // Generic route comes after specific ones
$route['api/users/permissions/definitions'] = 'users/permission_definitions';
$route['api/users/permissions/role-mappings'] = 'users/role_mappings';
$route['api/users/roles'] = 'users/roles';
$route['api/users/roles/(:any)/permissions'] = 'users/role_permissions/$1';
```

## 🔍 **How It Works**

1. **URL:** `PUT /api/users/1/settings`
2. **Route Match:** `$route['api/users/(:num)/settings']`
3. **Controller:** `users/settings/$1`
4. **Method Called:** `Users::settings(1)`
5. **HTTP Method:** Detected via `$this->input->server('REQUEST_METHOD')`
6. **Action:** Updates user settings via `User_model::update_user_settings()`

## ✅ **Verification**

The controller method already exists and handles:
- ✅ GET requests (load settings)
- ✅ PUT/PATCH requests (update settings)
- ✅ User existence validation
- ✅ Error handling

## 🧪 **Testing**

After adding the route, test with:

**GET Settings:**
```bash
curl -X GET http://localhost/hms/index.php/api/users/1/settings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**PUT Settings:**
```bash
curl -X PUT http://localhost/hms/index.php/api/users/1/settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "consultation_fee": 1000,
    "follow_up_charges": 500,
    "share_type": "Rupees",
    "instant_booking": true
  }'
```

## 📋 **Next Steps**

1. ✅ Route added to routes.php
2. ⏳ Clear CodeIgniter cache (if using caching)
3. ⏳ Test the endpoint
4. ⏳ Verify database tables exist (run migration if needed)

## 🔧 **Troubleshooting**

If still getting 404:

1. **Check .htaccess:**
   - Ensure mod_rewrite is enabled
   - Verify .htaccess file exists in root

2. **Clear Cache:**
   ```bash
   # Delete cache files
   rm -rf application/cache/*
   ```

3. **Check Route Order:**
   - Ensure `settings` route comes before generic `(:num)` route

4. **Verify Controller:**
   - Check `application/controllers/Users.php`
   - Verify `settings()` method exists

5. **Check Logs:**
   ```bash
   tail -f application/logs/log-*.php
   ```

## ✅ **Status**

**Route Added:** ✅  
**Controller Method:** ✅ (Already exists)  
**Database Tables:** ✅ (Migration file created)  
**Ready to Test:** ✅

---

**Fix Applied:** Route added to `application/config/routes.php`  
**Date:** Current  
**Status:** Ready for testing

