@echo off
REM Production Build Script for Hospital Management System (Windows)

echo Building Hospital Management System for Production...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Clean previous build
echo Cleaning previous build...
if exist "dist" rmdir /s /q dist
echo.

REM Build for production
echo Building for production...
call npm run build

REM Check if build was successful
if exist "dist" (
    echo.
    echo Build completed successfully!
    echo.
    echo Build output: .\dist
    echo.
    echo Next steps:
    echo   1. Upload all files from .\dist to /azanhospital/
    echo   2. Upload backend files to /backendhospital/
    echo   3. Configure database settings in backend
    echo.
    echo URLs:
    echo   Frontend: https://0neconnect.com/azanhospital
    echo   Backend:  https://0neconnect.com/backendhospital
    echo.
) else (
    echo.
    echo Build failed! Please check the errors above.
    exit /b 1
)

pause



