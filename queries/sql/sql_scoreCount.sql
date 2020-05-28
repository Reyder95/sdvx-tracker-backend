SELECT 
    COUNT(*) scoreNumber 
FROM 
    scores 
WHERE 
    user_fk = ${userID}