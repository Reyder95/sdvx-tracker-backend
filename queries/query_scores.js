var dbInfo = require('./query_start.js');

const sql_getScoresBySong = dbInfo.sql('./sql/sql_getScoresBySong.sql');

const getScoresBySong = (req, res, next) => {
    const songID = req.query.id;
    
    dbInfo.db.any(sql_getScoresBySong, {songID: songID})
        .then((data) => {
            res.status(200)
                .json({
                    status: "Success",
                    data: data,
                    message: "Retrieved scores"
                });
        })
        .catch ((err) => {
            return next(err);
        });
}

module.exports = {
    getScoresBySong: getScoresBySong
}