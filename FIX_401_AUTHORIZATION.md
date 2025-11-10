# Fix 401 Unauthorized Error - Authorization Header Issue

## Problem
Getting `401 Unauthorized` when accessing `/api/doctors` endpoint. This is typically caused by Apache not passing the `Authorization` header to PHP.

## Solution

### Step 1: Update .htaccess File

Make sure you have a `.htaccess` file in the root directory (`C:\xampp8\htdocs\hms\.htaccess`). 

If you only have `htaccess.txt`, rename it to `.htaccess`:

```bash
# In Windows, you may need to rename it manually or use:
ren htaccess.txt .htaccess
```

The `.htaccess` file should contain:

```apache
RewriteEngine On

# Pass Authorization header to PHP (Apache sometimes strips it)
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule .* - [e=HTTP_AUTHORIZATION:%1]

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php/$1 [L]

# Enable CORS
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, Accept, Origin"
    Header set Access-Control-Allow-Credentials "true"
    
    # Handle preflight requests
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=200,L]
</IfModule>
```

### Step 2: Verify Apache mod_rewrite is Enabled

1. Open `httpd.conf` (usually in `C:\xampp8\apache\conf\httpd.conf`)
2. Find and uncomment (remove the `#`):
   ```apache
   LoadModule rewrite_module modules/mod_rewrite.so
   ```
3. Restart Apache

### Step 3: Check if You're Logged In

The 401 error can also occur if:
- You're not logged in (no token in localStorage)
- The token has expired
- The token is invalid

**To check:**
1. Open browser DevTools (F12)
2. Go to Application/Storage → Local Storage
3. Look for `hms-token` key
4. If it doesn't exist or is empty, you need to log in first

### Step 4: Test Authentication

1. **Login first:**
   ```bash
   POST http://localhost/hms/api/auth/login
   Content-Type: application/json
   
   {
     "email": "admin@hospital.com",
     "password": "admin123"
   }
   ```

2. **Copy the token from the response**

3. **Test the doctors endpoint with the token:**
   ```bash
   GET http://localhost/hms/api/doctors
   Authorization: Bearer YOUR_TOKEN_HERE
   ```

### Step 5: Debug Authorization Header

If still not working, check the logs:

1. Check `application/logs/` for debug messages
2. The updated `Api.php` controller now logs debug information when token is not found

### Step 6: Alternative - Use X-Authorization Header

If Apache still doesn't pass the Authorization header, you can modify the frontend to use a custom header:

**Frontend (api.ts):**
```typescript
if (this.token) {
  headers['Authorization'] = `Bearer ${this.token}`;
  headers['X-Authorization'] = `Bearer ${this.token}`; // Fallback
}
```

**Backend (Api.php):**
```php
// Also check X-Authorization header
if (!$token) {
    $x_auth = $this->input->server('HTTP_X_AUTHORIZATION');
    if ($x_auth && preg_match('/Bearer\s+(.*)$/i', $x_auth, $matches)) {
        $token = $matches[1];
    }
}
```

## Quick Test

1. **Check if .htaccess exists:**
   ```bash
   dir .htaccess
   ```

2. **If not, create it:**
   ```bash
   copy htaccess.txt .htaccess
   ```

3. **Restart Apache in XAMPP Control Panel**

4. **Clear browser cache and try again**

5. **Check browser console for errors**

## Common Issues

### Issue: "Token not provided"
- **Cause:** Authorization header not reaching PHP
- **Fix:** Ensure `.htaccess` has the rewrite rule for Authorization header
- **Fix:** Restart Apache after updating .htaccess

### Issue: "Invalid token"
- **Cause:** Token exists but is invalid/expired
- **Fix:** Log in again to get a new token
- **Fix:** Check if token exists in `sessions` table in database

### Issue: Still getting 401 after fixes
- **Cause:** mod_rewrite not enabled
- **Fix:** Enable mod_rewrite in httpd.conf and restart Apache

## Verification

After applying fixes, test with:

```bash
curl -X GET "http://localhost/hms/api/doctors" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Should return:
```json
{
  "success": true,
  "data": [...]
}
```

Instead of:
```json
{
  "success": false,
  "message": "Token not provided"
}
```

