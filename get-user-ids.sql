-- Query to get all user IDs and their emails
SELECT id, email, role, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- If you want to find a specific user by email:
-- SELECT id, email, role FROM users WHERE email = 'your-email@example.com';
