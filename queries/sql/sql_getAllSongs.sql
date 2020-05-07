SELECT 
	s.id,
	s.title,
	s.artist,
	s.type,
	s.verified,
	s.game,
	s.bpm,
	s.effector,
	s.custom_link,
	s.jacket_fp,
	s.jacket_link,
	u.username,
	json_agg(c) AS dfficulties
FROM 
	songs s
INNER JOIN users u ON s.user_fk = u.id
INNER JOIN charts c ON c.song_fk = s.id
INNER JOIN (
    SELECT song_fk FROM charts WHERE charts.level > ${lower} AND charts.level < ${upper}
) levelCheck ON levelCheck.song_fk = s.id
WHERE (${search}) AND game ILIKE ${game}
GROUP BY s.id, u.id ORDER BY id DESC OFFSET 0 LIMIT 20;