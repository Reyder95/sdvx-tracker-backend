SELECT 
	u.id, 
	u.username, 
	u.date_joined, 
	u.pf_picture,
	COUNT(sc.*) scoreCount
FROM 
	users u
LEFT OUTER JOIN scores sc ON sc.user_fk = u.id
WHERE u.username LIKE ${search}
GROUP BY u.id
ORDER BY scoreCount DESC
OFFSET ${offset} LIMIT 10