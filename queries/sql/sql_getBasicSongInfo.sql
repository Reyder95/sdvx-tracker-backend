SELECT s.*, u.username
FROM
    songs s
INNER JOIN users u ON u.id = s.user_fk
WHERE
    s.id = ${songID}