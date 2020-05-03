SELECT 
	u.username,
	u.date_joined,
	u.pf_picture,
	r.name AS role
FROM
	users u,
	roles r
WHERE
	u.role_fk = r.id;