var express = require('express');
var router = express.Router();
var db_users = require('../queries/query_users.js');
var db_songs = require('../queries/query_songs.js');
var db_scores = require('../queries/query_scores.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/users', db_users.getAllUsers);

router.get('/api/songs', db_songs.getAllSongs);

router.get('/api/scores', db_scores.getScoresBySong);

module.exports = router;
