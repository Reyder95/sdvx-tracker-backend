var express = require('express');
var router = express.Router();
var cors = require('cors');

var withOptions = {
  origin: process.env.ORIGIN.split(' '),
  credentials: true
}

var userDB = require('../queries/query_users')
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/getloggedin', cors(withOptions), function(req, res, next) {
  console.log(req.signedCookies)


  if (req.signedCookies.user_id) {
    userDB.getUserById(req.signedCookies.user_id) 
    .then(data => {
      res.status(200)
        .json({
          id: req.signedCookies.user_id,
          username: data.username
        })
    })
  }
  else {
    next(new Error("Not logged in"))
  }
})

module.exports = router;
