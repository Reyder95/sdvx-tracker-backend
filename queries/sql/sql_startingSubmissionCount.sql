SELECT 
	u.id, 
	u.username, 
	u.date_joined, 
	u.pf_picture,
	COUNT(s.*) AS submissioncount
FROM
	users u
LEFT OUTER JOIN songs s ON s.user_fk = u.id
WHERE u.username LIKE ${search}
GROUP BY u.id
ORDER BY submissionCount DESC
OFFSET ${offset} LIMIT 10