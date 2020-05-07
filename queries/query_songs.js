var dbInfo = require('./query_start.js');

const sql_getAllSongs = dbInfo.sql('./sql/sql_getAllSongs.sql');

function FilterSet(filters) {
    if (!filters || typeof filters !== 'object') {
        throw new TypeError('Parameter \'filters\' must be an object.');
    }
    this._rawDBType = true;
    this.formatDBType = function () {
        var keys = Object.keys(filters);
        var s = keys.map(function (k) {
            return dbInfo.pgp.as.name(k) + ' ILIKE ${' + k + '}';
        }).join(' OR ');
        return dbInfo.pgp.as.format(s, filters);
    };
}

const getAllSongs = (req, res, next) => {   

    let page = parseInt(req.query.p)
    let offset = page * 10 - 10
    let search = req.query.s;

    if (search === undefined) {
        console.log(search);
        search = '';
    }

    var filter = new FilterSet({
       artist: '%' + search + '%',
       title: '%' + search + '%'
    });

    var test = dbInfo.pgp.as.format('WHERE ${search}', {search: filter})

    console.log(test)

    console.log(sql_getAllSongs.toString);

    dbInfo.db.any(sql_getAllSongs, {offset: offset, search: filter})
        .then((data) => {
            let next_page = false;
            let numElements = Object.keys(data).length;

            if (numElements > 10)
            {
                next_page = true;

                data = data.slice(0, 10)
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