var dbInfo = require('./query_start.js');
const jwt = require('jsonwebtoken')

const sql_getAllSongs = dbInfo.sql('./sql/sql_getAllSongs.sql');
const sql_getBasicSongInformation = dbInfo.sql('./sql/sql_getBasicSongInfo.sql');
const sql_addSong = dbInfo.sql('./sql/sql_addSong.sql')

function FilterSet(filters) {
    if (!filters || typeof filters !== 'object') {
        throw new TypeError('Parameter \'filters\' must be an object.');
    }
    this._rawDBType = true;
    this.formatDBType = function () {
        console.log('LOL')
        var keys = Object.keys(filters);
        
        var s = keys.map(function (k) {
            if (k != 'game')
                return dbInfo.pgp.as.name(k) + ' ILIKE ${' + k + '}';
            if (k == 'game') {  
                if (filters.game == '%%%%')
                    return '(' + dbInfo.pgp.as.name(k) + ' ILIKE ${' + k + '} OR game IS NULL)';
                else
                    return '(' + dbInfo.pgp.as.name(k) + ' ILIKE ${' + k + '} AND game IS NOT NULL)';
            }
                
        })

        s[0] = '(' + s[0].substring(0, s[0].length);
        s[1] = s[1].substring(0, s[1].length) + ')';
        let a = s.slice(0, -1).join(' OR ') + ' AND ' + s.slice(-1);
        
        return dbInfo.pgp.as.format(a, filters);
        
    };
}

function isEmpty(obj) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key))
            return false
    }

    return true
}

function UpdateFilterSet(filters) {
    if (!filters || typeof filters !== 'object') {
        throw new TypeError('Parameter \'filters\' must be an object.')
    }

    this._rawDBType = true;

    this.formatDBType = function () {
        var keys = Object.keys(filters);
        
        var s = keys.map(function (k) {
                return dbInfo.pgp.as.name(k) + ' = ${' + k + '}';
        }).join(', ')
        
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

    if (req.signedCookies.user_id)
    {
        jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
            if (err) {
                res.sendStatus(403);
            } else {
                
                let title = req.body.postObject.title;
                let artist = req.body.postObject.artist;
                let type = req.body.postObject.type;
                let verified = false;
                let game = null;
                let bpm = null;
                let effector = null;
                let custom_link = null;
                let jacket = null;
                let userID = req.signedCookies.user_id;
            
                if (req.body.postObject.game != null)
                    game = req.body.postObject.game
                
                if (req.body.postObject.bpm != null)
                    bpm = req.body.postObject.bpm
                
                if (req.body.postObject.effector != null)
                    effector = req.body.postObject.effector
            
                if (req.body.postObject.custom_link != null && req.body.type == 'custom')
                    custom_link = req.body.postObject.custom_link
            
                if (req.body.postObject.jacket != null)
                    jacket = req.body.postObject.jacket
            
                if (req.body.postObject.difficulties.length > 0)
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
                            .catch(err => {
                                next(err)
                            })
            
                            query = "INSERT INTO charts (difficulty, level, song_fk) VALUES (${difficulty}, ${level}, ${song_fk})";
            
                            if (req.body.postObject.difficulties < 1)
                                return Promise.reject("No difficulties!")
            
                            let diffresult = req.body.postObject.difficulties.map(diff => dbInfo.db.none(query, {
                                difficulty: diff.name,
                                level: diff.level,
                                song_fk: songID.id
                            }))
            
                            await Promise.all(diffresult)
                            return songID
            
            
                        }).then(data => {
                            res.status(200)
                            .json({
                                status: 'Success!',
                                id: data.id,
                                authData
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
        })
    }
    else
    {
        res.status(403)
        .json({
            message: "You are not signed in!"
        })
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
       title: '%' + search + '%',
       game: '%' + game + '%'
    });

    let test = dbInfo.pgp.as.format("WHERE $1", filter);
  
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

const updateSong = (req, res, next) => {

    if (req.signedCookies.user_id) {
        jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
            if (err) 
                res.sendStatus(403);
            else {
                    let songID = req.body.postObject.id;
    
                    let filters = {}
                    let filterObject = {}
        
                    // Check which parameters are valid and assign them to variables
                    if (req.body.postObject.jacket != null) {
                        filterObject.jacket = req.body.postObject.jacket
                    }
        
                    if (req.body.postObject.title != null)
                        filterObject.title = req.body.postObject.title
        
                    if (req.body.postObject.artist != null)
                        filterObject.artist = req.body.postObject.artist
        
                    if (req.body.postObject.effector != null)
                        filterObject.effector = req.body.postObject.effector
        
                    if (req.body.postObject.bpm != null)
                        filterObject.bpm = req.body.postObject.bpm
        
                    if (req.body.postObject.game != null)
                        filterObject.game = req.body.postObject.game
        
                    if (req.body.postObject.type != null)
                        filterObject.type = req.body.postObject.type
        
                    if (req.body.postObject.custom_link != null)
                        filterObject.custom_link = req.body.postObject.custom_link
        
                    if (!isEmpty(filterObject)) {
                        filters = new UpdateFilterSet(filterObject)
                        let test = dbInfo.pgp.as.format("SET $1", filters);

                        dbInfo.db.one("SELECT * FROM songs WHERE id = ${songID}", { songID: songID })
                        .then(songData => {

                            console.log(songData.user_fk)
                            console.log(req.signedCookies.user_id)

                            if (songData.user_fk != req.signedCookies.user_id)
                                res.sendStatus(403)
                            else {
                                dbInfo.db.tx(async t => { 
            
                                    await dbInfo.db.none("UPDATE songs SET ${search} WHERE id = ${songID}", { search: filters, songID: songID})
            
                                }).then(data => {
                                    res.status(200)
                                    .json({
                                        status: 'Success!'
                                    })
                                }, err => {
                                    next(err)
                                });
                            }
                            
                        })
        
                        
                    }
                    else
                    {
                        res.status(500)
                        .json({
                            message: "No filters specified"
                        })
                    }
                }
        })
    }
    else {
        res.status(403)
        .json({
            message: "You must be logged in!"
        })
    }

    
}

module.exports = {
    getAllSongs: getAllSongs,
    getBasicSongInformation: getBasicSongInformation,
    addSong: addSong,
    updateSong: updateSong
}