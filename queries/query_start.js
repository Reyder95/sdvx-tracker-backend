var promise = require('bluebird');

var options = {
    promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = require('./connectionString.json');
var db = pgp(connectionString);

module.exports = {
    pgp: pgp,
    connectionString: connectionString,
    db: db
}
