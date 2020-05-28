var dbInfo = require('./query_start.js');

const sql_getAllUsers = dbInfo.sql('./sql/sql_getAllUsers.sql');
        
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

function getUserByEmail(email) {
    return dbInfo.db.oneOrNone("SELECT * FROM users WHERE email = $1 LIMIT 1", email, a => !!a)
}

function getUserByUsername(username) {
    return dbInfo.db.oneOrNone("SELECT * FROM users WHERE username = $1 LIMIT 1", username, a => !!a)
}

function getUserByUsernameOrEmail(key) {
    return dbInfo.db.any("SELECT * FROM users WHERE username = $1 OR email = $1 LIMIT 1", key, a => !!a)
}

function insertUserIntoDatabase(username, email, password) {
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

function getUserById(id) {
    return dbInfo.db.one("SELECT username FROM users WHERE id = $1 LIMIT 1", id)
}

module.exports = {
    getAllUsers: getAllUsers,
    getUserByEmail: getUserByEmail,
    getUserByUsername: getUserByUsername,
    insertUserIntoDatabase: insertUserIntoDatabase,
    getUserByUsernameOrEmail: getUserByUsernameOrEmail,
    getUserById: getUserById
}