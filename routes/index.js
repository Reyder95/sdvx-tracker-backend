var express = require('express');
var router = express.Router();
var db_users = require('../queries/query_users.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/users', db_users.getAllUsers);

module.exports = router;
