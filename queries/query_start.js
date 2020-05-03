var promise = require('bluebird');
const path = require('path');

var options = {
    promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = require('./connectionString.json');
var db = pgp(connectionString);

const sql = (file) => {
    const fullPath = path.join(__dirname, file);
    return new pgp.QueryFile(fullPath, { minify: true});
}

module.exports = {
    pgp: pgp,
    connectionString: connectionString,
    db: db,
    sql: sql
}
