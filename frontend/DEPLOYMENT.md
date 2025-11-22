# Deployment Guide

## Production URLs
- **Frontend**: https://0neconnect.com/azanhospital
- **Backend API**: https://0neconnect.com/backendhospital

## Building for Production

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Build the Frontend
```bash
npm run build
```

This will create a `dist` folder with all the production-ready files.

### 3. Deploy Frontend Files

Upload all files from the `dist` folder to:
```
/azanhospital/
```

### 4. Deploy Backend Files

Upload all CodeIgniter files to:
```
/backendhospital/
```

Make sure to:
- Update `application/config/database.php` with production database credentials
- Set proper file permissions (755 for directories, 644 for files)
- Update `application/config/config.php` base_url if needed
- Ensure `.htaccess` is properly configured

## Environment Configuration

The API URL is automatically configured based on the build:
- **Development**: Uses `http://localhost/hms`
- **Production**: Uses `https://0neconnect.com/backendhospital`

You can override this by creating a `.env.production` file:
```
VITE_API_URL=https://0neconnect.com/backendhospital
```

## Build Script

Run the build command:
```bash
npm run build
```

The output will be in the `dist` folder, ready for deployment.

## Post-Deployment Checklist

- [ ] Verify frontend is accessible at https://0neconnect.com/azanhospital
- [ ] Verify backend API is accessible at https://0neconnect.com/backendhospital
- [ ] Test login functionality
- [ ] Check CORS configuration in backend
- [ ] Verify database connection
- [ ] Test API endpoints
- [ ] Check file permissions
- [ ] Verify .htaccess is working

## Troubleshooting

### CORS Issues
If you encounter CORS errors, check:
1. `application/config/cors.php` - CORS configuration
2. `application/hooks/Cors_hook.php` - CORS hook
3. `.htaccess` file in backend root

### API Not Found
- Check that `index.php` is in the backend root
- Verify `.htaccess` rewrite rules
- Check Apache mod_rewrite is enabled

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`




