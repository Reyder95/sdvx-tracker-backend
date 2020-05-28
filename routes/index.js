var express = require('express');
var router = express.Router();
var app = express();
var cors = require('cors')

var db_users = require('../queries/query_users.js');
var db_songs = require('../queries/query_songs.js');
var db_scores = require('../queries/query_scores.js');

var withOptions = {
  origin: 'http://localhost:8000',
  credentials: true,
  allowedHeaders: 'Content-Type,Authorization'
}

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Crontrol-Allow-Headers', 'Authorization')
  next();
});

// Format of token
// Authorization: Bearer <access_token>

// Verify JWT Token
const verifyToken = (req, res, next) => {
  // Get authentication header value
  const bearerHeader = req.headers['authorization'];
  
  // Check if bearer is undefined
  if (typeof bearerHeader !== 'undefined') {
    // Split at the space
    const bearer = bearerHeader.split(' ');

    console.log('lol');

    // Get token from array
    const bearerToken = bearer[1];

    // Set the token
    req.token = bearerToken;

    // Next middleware
    next();
  } else {
    // Forbidden
    console.log(req.headers)
    res.sendStatus(403)
  }
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/users', db_users.getAllUsers);

router.get('/api/songs', db_songs.getAllSongs);

router.get('/api/scores', db_scores.getScoresBySong);

router.options('*', cors(withOptions));
router.post('/api/add_score', [cors(withOptions), verifyToken], db_scores.addScore);

router.post('/api/delete_score', [cors(withOptions), verifyToken], db_scores.delScore);

router.post('/api/add_song', db_songs.addSong);

router.get('/api/song_single', db_songs.getBasicSongInformation);

router.get('/api/user', db_users.getUserInfo);

module.exports = router;
