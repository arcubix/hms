-- Fix admin user password
-- Run this in phpMyAdmin SQL tab

UPDATE `users` 
SET `password` = '$2y$10$o8lhHSu0xlzJ9MuhssC0PuxOct.AhFEP7VfIipvYgfVV5ELJB8V1G' 
WHERE `email` = 'admin@hospital.com';

-- Verify the update
SELECT id, name, email, role, status, LEFT(password, 30) as password_hash FROM users WHERE email = 'admin@hospital.com';

