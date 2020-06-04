SELECT 
    username, 
    date_joined, 
    pf_picture,
    discord,
    twitter,
    twitch
FROM 
    users 
WHERE 
    id = ${userID}