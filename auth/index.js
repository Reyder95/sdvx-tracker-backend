const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userDB = require('../queries/query_users')

function validUser(user) {
    const validEmail = typeof user.email == 'string' &&
                        user.email.trim() != ''
    const validPassword = typeof user.password == 'string' &&
                            user.password.trim() != '' &&
                            user.password.trim().length >= 6


    return validEmail && validPassword                            

                            
}

function validLoginUser(user) {
    const validKey = typeof user.key == 'string' &&
                      user.key.trim() != ''

    const validPassword = typeof user.password == 'string' &&
                            user.password.trim() != '' &&
                            user.password.trim().length >= 6

    return validKey && validPassword
}

router.get('/', (req, res) => {
    res.json({
        message: 'Success!'
    })
})

router.post('/signup', (req, res, next) => {
    
    
    if (validUser(req.body))
    {
        userDB.getUserByEmail(req.body.email)
            .then(exists => {
                if (!exists)
                {
                    userDB.getUserByUsername(req.body.username)
                    .then(user => {
                        if(!user) { 

                            bcrypt.hash(req.body.password, 10)
                                .then((hash) => {
                                    userDB.insertUserIntoDatabase(req.body.username, req.body.email, hash)
                                        .then(data => {
                                            res.status(200)
                                                .json({
                                                    message: "Successfully signed up!"
                                                })
                                        })
                                        .catch(function(err) {
                                            next(new Error(err))
                                        })
                                })


                        }
                        else {
                            next(new Error('Username in use'))
                        }
                    })
                }
                else {
                    next(new Error("Email in use"))
                }


            })
            .catch(function (err) {
                next(new Error(err))
            })

            } else {
                next(new Error('Invalid user'))
            }
    
})

router.post('/login', (req, res, next) => {
    if (validLoginUser(req.body)) {
        userDB.getUserByUsernameOrEmail(req.body.key)
        .then(user => {
            if (user.length == 1)
            {
                bcrypt.compare(req.body.password, user[0].password)
                    .then((result) => {
                        if (result)
                        {
                            const isSecure = req.app.get('env') != 'development'
                            res.cookie('user_id', user[0].id, {
                                httpOnly: true,
                                secure: isSecure,
                                signed: true
                            })

                            jwt.sign({user: result}, 'mysecretkey', (err, token) => {
                                res.status(200)
                                .json({
                                    token
                                })
                            })

                            
                        }
                        else {
                            next(new Error("Invalid Login"))
                        }

                    })

            }
            else {
                next(new Error("User not found"))
            }

        })
    } else {
        next(new Error("Invalid Login"))
    }
})

router.get('/logout', (req, res, next) => {
    res.clearCookie('user_id');

    res.json({
        message: 'Successfully logged out!'
    })
    .catch((err) => {
        next(new Error(err))
    })
})

module.exports = router;