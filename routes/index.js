var express = require('express');
var router = express.Router();
var app = express();
var cors = require('cors')

var db_users = require('../queries/query_users.js');
var db_songs = require('../queries/query_songs.js');
var db_scores = require('../queries/query_scores.js');

var withOptions = {
  origin: 'http://localhost:8000',
  credentials: true
}

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/users', db_users.getAllUsers);

router.get('/api/songs', db_songs.getAllSongs);

router.get('/api/scores', db_scores.getScoresBySong);

router.post('/api/add_score', cors(withOptions), db_scores.addScore);

router.post('/api/delete_score', cors(withOptions), db_scores.delScore);

router.get('/api/song_single', db_songs.getBasicSongInformation);

module.exports = router;
