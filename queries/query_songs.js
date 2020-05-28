var dbInfo = require('./query_start.js');

const sql_getAllSongs = dbInfo.sql('./sql/sql_getAllSongs.sql');
const sql_getBasicSongInformation = dbInfo.sql('./sql/sql_getBasicSongInfo.sql');
const sql_addSong = dbInfo.sql('./sql/sql_addSong.sql')

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

const getBasicSongInformation = (req, res, next) => {
    let songID = req.query.id;

    dbInfo.db.any(sql_getBasicSongInformation, {
        songID: songID
    })
    .then((data) => {
        res.status(200)
        .json({
            status: 'Success!',
            data: data,
            message: 'Successfully retrieved songs with ID ' + songID
        })
    })
    .catch(err => {
        return next(err)
    })
}

const addSong = (req, res, next) => {
    let title = req.body.title;
    let artist = req.body.artist;
    let type = req.body.type;
    let verified = false;
    let game = null;
    let bpm = null;
    let effector = null;
    let custom_link = null;
    let jacket = null;
    let userID = req.body.uid;
    let novice = 0;
    let advanced = 0;
    let exhaust = 0;
    let maximum = 0;

    if (req.body.game != null)
        game = req.body.game
    
    if (req.body.bpm != null)
        bpm = req.body.bpm
    
    if (req.body.effector != null)
        effector = req.body.effector

    if (req.body.custom_link != null && req.body.type == 'custom')
        custom_link = req.body.custom_link

    if (req.body.jacket != null)
        jacket = req.body.jacket

    if (req.body.difficulties.length > 0)
    {
        dbInfo.db.tx(async t => {
            let songID = await dbInfo.db.one(sql_addSong, {
                title: title,
                artist: artist,
                type: type,
                verified: verified,
                game: game,
                bpm: bpm,
                effector: effector,
                custom_link: custom_link,
                jacket: jacket,
                userID: userID
                })

                query = "INSERT INTO charts (difficulty, level, song_fk) VALUES (${difficulty}, ${level}, ${song_fk})";

                if (req.body.difficulties < 1)
                    return Promise.reject("No difficulties!")

                let diffresult = req.body.difficulties.map(diff => dbInfo.db.none(query, {
                    difficulty: diff.name,
                    level: diff.level,
                    song_fk: songID.id
                }))

                return Promise.all(diffresult)


            }).then(data => {
                res.status(200)
                .json({
                    status: 'Success!',
                    data
                })
            }, err => {
                next(err)
            });
    }
    else 
    {
        next(new Error("Please provide at least one difficulty when inserting songs!"))
    }
    
}

const getAllSongs = (req, res, next) => {   

    let page = 1
    let offset = page * 10 - 10
    let search = ''
    let level = 0
    let game = '%%'
    let type = '%%'
    let lowerLevel = 0;
    let upperLevel = 21;

    if (req.query.s != null)
        search = req.query.s

    if (req.query.l != null )
        level = req.query.l

    if (req.query.g != null)
        game = "%" + req.query.g + "%"

    if (req.query.t != null)
        type = "%" + req.query.t + "%"

    if (req.query.p != null)
    {
        page = req.query.p
        offset = page * 10 - 10
    }

    var filter = new FilterSet({
       artist: '%' + search + '%',
       title: '%' + search + '%'
    });
  
    if (level != 0)
    {
        lowerLevel = parseInt(level) - 1;
        upperLevel = parseInt(level) + 1;
    }

    dbInfo.db.any(sql_getAllSongs, 
        {
            offset: offset, 
            search: filter, 
            lower: lowerLevel, 
            upper: upperLevel, 
            game: game, 
            type: type
        })
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
    getAllSongs: getAllSongs,
    getBasicSongInformation: getBasicSongInformation,
    addSong: addSong
}