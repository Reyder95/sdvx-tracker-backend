var dbInfo = require('./query_start.js');

const sql_getAllSongs = dbInfo.sql('./sql/sql_getAllSongs.sql');

const getAllSongs = (req, res, next) => {
    dbInfo.db.any(sql_getAllSongs)
        .then((data) => {
            res.status(200)
                .json({
                    status: "Success!",
                    data: data,
                    message: "Retrieved all songs"
                });
        })
        .catch ((err) => {
            return next(err);
        });
}

module.exports = {
    getAllSongs: getAllSongs
}