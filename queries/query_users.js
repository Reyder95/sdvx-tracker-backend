var dbInfo = require('./query_start.js');
var path = require('path');
var jwt = require('jsonwebtoken')

const sql_getAllUsers = dbInfo.sql('./sql/sql_getAllUsers.sql');
const sql_getUser = dbInfo.sql('./sql/sql_getUser.sql');
const sql_libraryCount = dbInfo.sql('./sql/sql_libraryCount.sql');
const sql_scoreCount = dbInfo.sql('./sql/sql_scoreCount.sql');
const sql_getUserGrades = dbInfo.sql('./sql/sql_getUserGrades.sql')
const sql_getUserRecentScores = dbInfo.sql('./sql/sql_getUserRecentScores.sql')
const sql_getUserLibrary = dbInfo.sql('/sql/sql_getUserLibrary.sql')

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

function isEmpty(obj) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key))
            return false
    }

    return true
}
        
function getAllUsers(req, res, next) {
    dbInfo.db.any(sql_getAllUsers)
        .then (function (data) {
            res.status(200)
                .json({
                    status: "Success!",
                    data: data,
                    message: "Retrieved all Users!"
                });
        })
        .catch (function (err) {
            return next(err);
        });
}

const getUserGrades = (req, res, next) => {

    console.log(req.query.l)

    let levelLower = 0;
    let levelHigher = 21;

    if (req.query.l != null)  {
        levelLower = parseInt(req.query.l) - 1;
        levelHigher = parseInt(req.query.l) + 1;
    }

    console.log(levelLower)

    dbInfo.db.any(sql_getUserGrades, {
        userID: req.query.id,
        levelLower: levelLower,
        levelHigher: levelHigher
    })
    .then(data => {
        res.status(200)
        .json({
            data
        })
    })
    .catch(err => {
        next(err)
    })
}

const getUserInfo = (req, res, next) => {
    dbInfo.db.one(sql_getUser, {
        userID: req.query.id
    })
    .then(userData => {
        dbInfo.db.one(sql_scoreCount, {
            userID: req.query.id
        })
        .then(scoreData => {
            dbInfo.db.one(sql_libraryCount, {
                userID: req.query.id
            })
            .then(libraryData => {
                res.status(200)
                .json({
                    userData,
                    scoreData,
                    libraryData
                })
            })
        })
        .catch(err => {
            next(err)
        })
    })
    .catch(err => {
        next(err)
    })
}

const getUserByEmail = (email) => {
    return dbInfo.db.oneOrNone("SELECT * FROM users WHERE email = $1 LIMIT 1", email, a => !!a)
}

const getUserByUsername = (username) => {
    return dbInfo.db.oneOrNone("SELECT * FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1", username, a => !!a)
}

const getUserByUsernameOrEmail = (key) => {
    return dbInfo.db.any("SELECT * FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1) LIMIT 1", key, a => !!a)
}

const insertUserIntoDatabase = (username, email, password) => {
    let date = new Date()

    let day = ("0" + date.getDate()).slice(-2)

    let month = ("0" + (date.getMonth() + 1)).slice(-2)

    let year = date.getFullYear()

    let hours = date.getHours()

    let minutes = date.getMinutes()

    let seconds = date.getSeconds()

    let currentDate = year + '-' + month + '-' + day + " " + hours + ":" + minutes + ":" + seconds

    return dbInfo.db.none("INSERT INTO users (username, password, email, date_joined, role_fk) VALUES ($1, $2, $3, $4, $5)", [username, password, email, currentDate, '1'])
}

const getRecentScoresByUser = (req, res, next) => {
    dbInfo.db.any(sql_getUserRecentScores, { userID: req.query.id })
    .then(result => {
        res.status(200)
        .json({
            result
        })
    })
    .catch(err => {
        next(err)
    })
}

const getUserLibrary = (req, res, next) => {
    dbInfo.db.any(sql_getUserLibrary, { userID: req.query.id})
    .then(result => {
        res.status(200)
        .json({
            result
        })
    })
    .catch(err => {
        next(err)
    })
}

const getUserById = (id) => {
    return dbInfo.db.one("SELECT username FROM users WHERE id = $1 LIMIT 1", id)
}

const uploadPictureToDB = (req, res, next) => {
    console.log("File " +  `uid-${req.params.uid + path.extname(req.file.originalname).toLowerCase()}`)
    
    if (req.signedCookies.user_id && req.signedCookies.user_id == req.params.uid) {
        jwt.verify(req.token, 'mysecretkey', (err, authData) => {
            if (err)
                res.sendStatus(403)
            else {
                dbInfo.db.none('UPDATE users SET pf_picture = ${picture} WHERE id = ${userID}', {
                    picture: `uid-${req.params.uid + path.extname(req.file.originalname).toLowerCase()}`,
                    userID: req.signedCookies.user_id
                })
                .then(result => {
                    res.status(200)
                    .json({
                        message: 'Success'
                    })
                })
                .catch(err => {
                    next(err)
                })
            }
        })
    } else {
        next(new Error('You must be logged in!'))
    }
}

const editProfileInformation = (req, res, next) => {
    if (req.signedCookies.user_id) {
        jwt.verify(req.token, 'mysecretkey', (err, authData) => {
            if (err)
                res.sendStatus(403)
            else {
                let filters = {}
                let filterObject = {}

                if (req.body.postObject.discord != null)
                    filterObject.discord = req.body.postObject.discord
                
                if (req.body.postObject.twitter != null)
                    filterObject.twitter = req.body.postObject.twitter

                if (req.body.postObject.twitch != null)
                    filterObject.twitch = req.body.postObject.twitch

                console.log(filterObject)
                if (!isEmpty(filterObject)) {
                    filters = new UpdateFilterSet(filterObject)
                    let test = dbInfo.pgp.as.format("SET $1", filters);
                    console.log(test)

                    dbInfo.db.none('UPDATE users SET ${filters} WHERE id = ${userID}', {
                        filters: filters,
                        userID: req.signedCookies.user_id
                    })
                    .then(result => {
                        res.status(200)
                        .json({
                            message: 'Success!'
                        })
                    })
                    .catch(err => {
                        next(new Error(err))
                    })
                }
                else {
                    next(new Error('No parameters specified'))
                }
            }
        })
    }
}

module.exports = {
    getAllUsers: getAllUsers,
    getUserByEmail: getUserByEmail,
    getUserByUsername: getUserByUsername,
    insertUserIntoDatabase: insertUserIntoDatabase,
    getUserByUsernameOrEmail: getUserByUsernameOrEmail,
    getUserById: getUserById,
    getUserInfo: getUserInfo,
    getUserGrades: getUserGrades,
    getRecentScoresByUser: getRecentScoresByUser,
    getUserLibrary: getUserLibrary,
    uploadPictureToDB: uploadPictureToDB,
    editProfileInformation: editProfileInformation
}