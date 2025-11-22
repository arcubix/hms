# Production Build Instructions

## Quick Start

### For Windows:
```bash
cd frontend
build.bat
```

### For Linux/Mac:
```bash
cd frontend
chmod +x build.sh
./build.sh
```

### Manual Build:
```bash
cd frontend
npm install
npm run build
```

## Deployment URLs

- **Frontend**: https://0neconnect.com/azanhospital
- **Backend API**: https://0neconnect.com/backendhospital

## Step-by-Step Deployment

### 1. Build Frontend
```bash
cd frontend
npm install
npm run build
```

This creates a `dist` folder with all production files.

### 2. Upload Frontend Files
Upload all contents of `frontend/dist/` to:
```
/azanhospital/
```

### 3. Upload Backend Files
Upload all CodeIgniter files to:
```
/backendhospital/
```

### 4. Configure Backend

Update `application/config/database.php`:
```php
$db['default'] = array(
    'hostname' => 'your_db_host',
    'username' => 'your_db_user',
    'password' => 'your_db_password',
    'database' => 'your_db_name',
    // ... rest of config
);
```

Update `application/config/config.php` if needed:
```php
$config['base_url'] = 'https://0neconnect.com/backendhospital/';
```

### 5. Set File Permissions
```bash
# Directories
chmod 755 /backendhospital/application
chmod 755 /backendhospital/system
chmod 755 /backendhospital/application/cache
chmod 755 /backendhospital/application/logs

# Files
chmod 644 /backendhospital/index.php
chmod 644 /backendhospital/.htaccess
```

### 6. Verify Deployment

1. Check frontend: https://0neconnect.com/azanhospital
2. Check backend API: https://0neconnect.com/backendhospital/api/auth/login
3. Test login functionality
4. Verify CORS is working

## Important Notes

- The API URL is automatically set to `https://0neconnect.com/backendhospital` in production builds
- Make sure CORS is properly configured in the backend
- Ensure `.htaccess` is working for URL rewriting
- Check that Apache mod_rewrite is enabled

## Troubleshooting

### Build Errors
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear cache: `rm -rf node_modules/.vite`

### CORS Issues
- Check `application/config/cors.php`
- Verify `application/hooks/Cors_hook.php` is enabled
- Check `.htaccess` in backend root

### API Not Found
- Verify `index.php` exists in backend root
- Check `.htaccess` rewrite rules
- Ensure Apache mod_rewrite is enabled




