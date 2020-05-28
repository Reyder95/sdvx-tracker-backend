SELECT
	COUNT(DISTINCT s.id) libraryNumber
FROM 
	songs s 
INNER JOIN (
	SELECT c.*, json_agg(sc.* ORDER BY score desc) AS scores FROM charts c
	LEFT OUTER JOIN (
		SELECT sc.*, ct.type FROM scores sc
		INNER JOIN clear_types ct ON ct.id = sc.clear_fk
	) sc ON sc.chart_fk = c.id
	INNER JOIN (
		SELECT DISTINCT chart_fk FROM scores 
		LEFT OUTER JOIN clear_types ct ON ct.id = scores.clear_fk
		WHERE scores.user_fk = ${userID}
	) userCheck ON userCheck.chart_fk = c.id
	GROUP BY c.id
) c ON c.song_fk = s.id
