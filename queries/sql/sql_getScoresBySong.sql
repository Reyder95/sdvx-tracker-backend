SElECT 
	s.*,
	json_agg(sub2) AS difficulties 
FROM 
	songs s 
INNER JOIN (
	SELECT c.*, json_agg(sub) scores FROM charts c
	LEFT OUTER JOIN (
		SELECT sc.*, ct.type FROM scores sc
		INNER JOIN clear_types ct ON ct.id = sc.clear_fk
		WHERE user_fk = ${userID}
		ORDER BY score DESC
	) sub ON sub.chart_fk = c.id
	GROUP BY c.id
) sub2 ON sub2.song_fk = s.id
WHERE 
	s.id = ${songID}
GROUP BY s.id