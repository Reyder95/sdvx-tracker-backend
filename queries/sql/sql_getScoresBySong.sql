SELECT
	s.*,
	json_agg(c) AS difficulties
FROM
	songs s
INNER JOIN (
	SELECT c.song_fk AS song_id, c.difficulty, c.level, json_agg(s) AS scores FROM charts c
	INNER JOIN (
		SELECT * FROM scores s
	) s ON s.chart_fk = c.id
	GROUP BY c.id
) c ON song_id = s.id
WHERE s.id = ${songID}
GROUP BY s.id;