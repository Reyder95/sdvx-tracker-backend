var dbInfo = require('./query_start.js');

const sql_getAllSongs = dbInfo.sql('./sql/sql_getAllSongs.sql');

const getAllSongs = (req, res, next) => {
    let page = parseInt(req.query.p)
    let offset = page * 10 - 10

    dbInfo.db.any(sql_getAllSongs, {offset: offset})
        .then((data) => {
            let next_page = false;
            let numElements = Object.keys(data).length;

            if (numElements > 10)
            {
                next_page = true;

                data = data.slice(0, 9)
            } else {
                data = data.slice(0, numElements);
            }


            res.status(200)
                .json({
                    status: "Success!",
                    data: data,
                    message: "Retrieved all songs",
                    next_page: next_page
                });
        })
        .catch ((err) => {
            return next(err);
        });
}

module.exports = {
    getAllSongs: getAllSongs
}