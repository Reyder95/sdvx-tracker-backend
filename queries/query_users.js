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

module.exports = {
    getAllUsers: getAllUsers
}