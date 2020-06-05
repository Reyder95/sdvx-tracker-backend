var dbInfo = require('./query_start.js');
const jwt = require('jsonwebtoken')

const sql_getScoresBySong = dbInfo.sql('./sql/sql_getScoresBySong.sql');
const sql_addScore = dbInfo.sql('./sql/sql_addScore.sql')
const sql_delScore = dbInfo.sql('./sql/sql_delScore.sql')

const addScore = (req, res, next) => {

    jwt.verify(req.token, 'mysecretkey', (err, authData) => {
        if (err) {
            res.sendStatus(403)
        } else {

            if (req.signedCookies.user_id)
            {
                let date = new Date()
        
                let day = ("0" + date.getDate()).slice(-2)
            
                let month = ("0" + (date.getMonth() + 1)).slice(-2)
            
                let year = date.getFullYear()
            
                let hours = date.getHours()
            
                let minutes = date.getMinutes()
            
                let seconds = date.getSeconds()
            
                let currentDate = year + '-' + month + '-' + day + " " + hours + ":" + minutes + ":" + seconds
        
                let grade = '';
        
                if (req.body.score < 7000000)
                    grade = 'D'
                else if (req.body.score >= 7000000 && req.body.score < 8000000)
                    grade = 'C'
                else if (req.body.score >= 8000000 && req.body.score < 8700000)
                    grade = 'B'
                else if (req.body.score >= 8700000 && req.body.score < 9000000)
                    grade = 'A'
                else if (req.body.score >= 9000000 && req.body.score < 9300000)
                    grade = 'A+'
                else if (req.body.score >= 9300000 && req.body.score < 9500000)
                    grade = 'AA'
                else if (req.body.score >= 9500000 && req.body.score < 9700000)
                    grade = 'AA+'
                else if (req.body.score >= 9700000 && req.body.score < 9800000)
                    grade = 'AAA'
                else if (req.body.score >= 9800000 && req.body.score < 9900000)
                    grade = 'AAA+'
                else
                    grade = 'S'
        
                dbInfo.db.one(sql_addScore, {
                    score: req.body.score,
                    grade: grade,
                    date: currentDate,
                    userID: req.signedCookies.user_id,
                    chartID: req.body.chart_id,
                    clearID: req.body.clear_id
                })
                .then((score) => {
                    dbInfo.db.one("SELECT type FROM clear_types WHERE id = ${id}", {
                        id: req.body.clear_id
                    })
                    .then((data) => {
                        res.status(200)
                        .json({
                            score: req.body.score,
                            type: data.type,
                            grade: grade,
                            score
                        })
                    })
                })
                .catch(err => {
                    next(new Error(err))
                })
            }
            else
            {
                next(new Error('User is not logged in!'))
            }
            
        }
    })


}

const delScore = (req, res, next) => {
        jwt.verify(req.token, 'mysecretkey', (err, authData) => {
            if (err) {
                res.status(403)
                .json({
                    err
                })
            } else {
                if (req.signedCookies.user_id)
                {
                    dbInfo.db.one("SELECT sc.user_fk FROM scores sc WHERE sc.id = ${scoreID}", {
                        scoreID: req.body.id
                    })
                    .then(result => {
                        if (result.user_fk == req.signedCookies.user_id) {
                            dbInfo.db.none(sql_delScore, {
                                scoreID: req.body.id
                            })
                            .then(() => {
                                res.status(200)
                                .json({
                                    status: "Success",
                                    authData
                                })
                            })
                            .catch(err => {
                                next(err)
                            })
                        }
                        else {
                            next(new Error('ACCESS DENIED'))
                        }
        
                    })
                    .catch(err => {
                        next(new Error(err))
                    })
                }
                    
                    
                else
                {
                    next(new Error("User is not logged in"))
                }
            }
        })
    }

const getScoresBySong = (req, res, next) => {
    let uid = req.query.uid;
    let sid = req.query.sid;

    dbInfo.db.any(sql_getScoresBySong, {
        userID: uid,
        songID: sid
    })
    .then(data => {
        res.status(200)
        .json({
            status: "Success!",
            data: data,
            message: "Retrieved all scores for user ID " + uid + " on song ID " + sid
        })
    })
    .catch((err) => {
        return next(err);
    })
}

module.exports = {
    getScoresBySong: getScoresBySong,
    addScore: addScore,
    delScore: delScore
}