var express = require('express');
var router = express.Router();
var app = express();
var path = require('path')
var cors = require('cors')
var multer = require('multer')
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/images')
  },
  filename: function (req, file, cb) {

    cb(null, `uid-${req.params.uid + path.extname(file.originalname).toLowerCase()}`)
  }
})
var upload = multer({
  storage: storage,
  fileFilter: (req, file, callback) => {
    var ext = path.extname(file.originalname).toLowerCase()
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg')
      return callback(new Error('Only images are allowed!'))
    callback(null, true)
  }
})

var db_users = require('../queries/query_users.js');
var db_songs = require('../queries/query_songs.js');
var db_scores = require('../queries/query_scores.js');

var withOptions = {
  origin: process.env.ORIGIN,
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

    // Get token from array
    const bearerToken = bearer[1];

    // Set the token
    req.token = bearerToken;

    // Next middleware
    next();
  } else {
    // Forbidden
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

router.post('/api/add_song', [cors(withOptions), verifyToken], db_songs.addSong);

router.post('/api/update_song', [cors(withOptions), verifyToken], db_songs.updateSong);

router.post('/api/add_difficulty', [cors(withOptions), verifyToken], db_songs.addDifficulty);

router.post('/api/profile_picture/:uid', [cors(withOptions), verifyToken, upload.single('profile')], db_users.uploadPictureToDB)

router.get('/api/song_single', db_songs.getBasicSongInformation);

router.post('/api/edit_profile', [cors(withOptions), verifyToken], db_users.editProfileInformation);

router.get('/api/user_recent', db_users.getRecentScoresByUser);

router.get('/api/user_library', db_users.getUserLibrary);

router.get('/api/user', db_users.getUserInfo);

router.get('/api/user_grades', db_users.getUserGrades);

module.exports = router;
