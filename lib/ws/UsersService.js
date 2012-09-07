var logger      = require("../util/Logger.js").getLogger()
var DBHelper    = require("../database/Helper.js").DBHelper

var bcrypt          = require("bcrypt")
var passport        = require('passport')
var LocalStrategy   = require('passport-local').Strategy

passport.use(new LocalStrategy(
    function(login, password, done) {

        process.nextTick(function () {

            DBHelper.User.findOne({login: login}, function (err, admin) {

                if (err) {
                    return done(err)
                }

                if (!admin) {
                    return done(null, false, {message: 'Unknown user'})
                }

                bcrypt.compare(password, admin.password, function(err, res) {
                    if(err) {
                        return done(err)
                    }
                    if(!res) {
                        return done(null, false, {message: 'Invalid password'})
                    }
                    return done(null, admin)
                })
            })
        })
    }

))

passport.serializeUser(function(user, done) {
    done(null, user.login)
})

passport.deserializeUser(function(login, done) {
    DBHelper.User.findOne({login: login}, function (err, user) {
        done(err, user)
    })
})



function UsersService(app) {

    return function() {


        /**
         * Login
         */
        app.post('/login', function(req, res, next) {
            passport.authenticate('local', function(err, user, info) {
                if (err) {
                    return next(err)
                }
                if (!user) {
                    if(info.message = 'Invalid password') {
                        var ip = req.ip
                        var ips = req.ips.length>0 ? req.ips : undefined
                        var ipsList = ''
                        if(ips) {
                            ipsList = '(' + ips.join('; ') + ')'
                        }
                        logger.warn('Authentication as [' + req.body.login + '] failed from ip: ' + ip + ipsList)
                    }
                    return res.redirect('/admin')
                }
                req.logIn(user, function(err) {
                    if (err) {
                        return next(err)
                    }
                    return res.redirect('/admin')
                })
            })(req, res, next)
        })

        /**
         * To know if this is the first login or if the user is authenticated
         */
        app.get("/status", function(req, res) {

            var status = {}

            if(req.user) {
                status.isAuthenticated = true
                return res.send(status)
            }

            DBHelper.User.find({}, function(err, users) {

                if(err) {
                    return res.error(err)
                }

                status.isFirstLogin = users.length === 0
                res.send(status)

            })
        })

        /**
         * Logout
         */
        app.get('/logout', function(req, res){
            req.logOut()
            res.redirect('/')
        })

        /**
         * Return a user
         */
        app.get("/user/:login", function(req, res) {

            var login = req.param("login")

            DBHelper.User.findOne({login: login}, function(err, user) {
                if(err) {
                    res.error(err)
                } else {
                    res.send(user)
                }
            })
        })

        /**
         * Return every users
         */
        app.get("/getUsers", function(req, res) {

            DBHelper.User.find({}, {sort: [['login','asc']]}, function(err, user) {
                if(err) {
                    res.error(err)
                } else {
                    res.send(user)
                }
            })
        })

        /**
         * Search for users
         */
        app.post("/search", function(req, res) {

            var login = req.body.login

            var query = {login: {$regex : login, $options: 'i'}}

            DBHelper.User.find(query, function(err, users) {
                if(err) {
                    res.error(err)
                } else {
                    res.send(users)
                }
            })
        })

    }
}

module.exports = UsersService