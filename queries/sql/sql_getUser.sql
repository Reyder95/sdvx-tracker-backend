SELECT 
    username, 
    date_joined, 
    pf_picture 
FROM 
    users 
WHERE 
    id = ${userID}