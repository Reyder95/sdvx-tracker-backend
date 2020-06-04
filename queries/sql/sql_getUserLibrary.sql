SELECT 
	s.*,
	json_agg(sub2) AS difficulties 
FROM 
	songs s 
INNER JOIN (
	SELECT c.*, json_agg(sub) scores FROM charts c
	INNER JOIN (
		SELECT sc.*, ct.type FROM scores sc
		INNER JOIN clear_types ct ON ct.id = sc.clear_fk
		WHERE sc.user_fk = ${userID}
	) sub ON sub.chart_fk = c.id
	GROUP BY c.id, sub.score
	ORDER BY sub.score ASC
) sub2 ON sub2.song_fk = s.id
GROUP BY s.id