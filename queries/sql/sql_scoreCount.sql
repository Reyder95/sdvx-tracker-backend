SELECT 
    COUNT(*) scorecount 
FROM 
    scores 
WHERE 
    user_fk = ${userID}