SELECT scores.grade, count(DISTINCT scores.chart_fk)
	FROM (
	SELECT
  		s.chart_fk,
  		s.score,
  		s.grade,
		levels.level
	FROM
  		scores s
	INNER JOIN (
    	SELECT DISTINCT ON (sc.chart_fk) MAX(sc.score) score, sc.chart_fk FROM scores sc WHERE user_fk = ${userID} GROUP BY sc.chart_fk 
	) sc ON sc.chart_fk = s.chart_fk AND sc.score = s.score
	INNER JOIN (
		SELECT id, c.level FROM charts c WHERE c.level > ${levelLower} AND c.level < ${levelHigher}
	) levels ON levels.id = sc.chart_fk
) scores
GROUP BY scores.grade