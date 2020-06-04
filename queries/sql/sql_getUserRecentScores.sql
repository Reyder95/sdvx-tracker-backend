SELECT * FROM scores s 
INNER JOIN charts c ON c.id = s.chart_fk
INNER JOIN songs so ON c.song_fk = so.id
WHERE s.user_fk = ${userID}
ORDER BY s.date DESC
LIMIT 5;