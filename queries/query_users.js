var dbInfo = require('./query_start.js');

function getAllUsers(req, res, next) {
    dbInfo.db.any('SELECT * FROM users')
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