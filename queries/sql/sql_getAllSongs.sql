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
INNER JOIN (
	SELECT * FROM charts c
) c ON c.song_fk = s.id
WHERE ${search}
GROUP BY s.id, u.id ORDER BY id DESC OFFSET ${offset} LIMIT 20;