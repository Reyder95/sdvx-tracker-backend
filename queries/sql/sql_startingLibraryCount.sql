SELECT 
	u.id, 
    u.username, 
    u.date_joined, 
    u.pf_picture,
	sc.libraryCount
FROM 
	users u
LEFT OUTER JOIN (
	SELECT sc.user_fk, COUNT(DISTINCT c.song_fk) libraryCount FROM scores sc
	LEFT OUTER JOIN (
		SELECT c.id, c.song_fk FROM charts c
		GROUP BY c.id
	) c ON c.id = sc.chart_fk
	GROUP BY sc.user_Fk
) sc ON sc.user_fk = u.id
WHERE u.username LIKE ${search}
GROUP BY u.id, sc.libraryCount
ORDER BY CASE WHEN libraryCount IS NULL THEN 1 ELSE 0 END, libraryCount DESC, u.username DESC
OFFSET ${offset} LIMIT 10;