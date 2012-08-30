var logger          = require("../util/Logger.js").getLogger("usersService")
var DBHelper        = require("../database/Helper.js").DBHelper
var bcrypt          = require("bcrypt")
var passport        = require('passport')
var LocalStrategy   = require('passport-local').Strategy

passport.use(new LocalStrategy(
    function(username, password, done) {

        process.nextTick(function () {

            DBHelper.Admin.findOne({username: username}, function (err, admin) {

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
    done(null, user.username)
})

passport.deserializeUser(function(username, done) {
    DBHelper.Admin.findOne({username: username}, function (err, user) {
        done(err, user)
    })
})


function AdminsService(app) {

    return function() {

        /**
         * Add a new admin
         */
        app.post("/", function(req, res) {

            var admin = req.body

            DBHelper.Admin.find({}, function(err, admins) {
                if(err) {
                    return res.error(err)
                }
                if(admins.length === 0 || req.isAuthenticated()) {
                    if(admin && admin.name && admin.pass1 && admin.pass2) {
                        if(admin.pass1.length >= 4 && admin.pass1 === admin.pass2) {

                            bcrypt.genSalt(10, function(err, salt) {
                                bcrypt.hash(admin.pass1, salt, function(err, hash) {
                                    var newAdmin = {
                                        username    : admin.name,
                                        password    : hash

                                    }
                                    DBHelper.Admin.save(newAdmin, function(err, savedAdmin) {
                                        if(err) {
                                            return res.error(err)
                                        }
                                        if(req.user) {
                                            res.redirect('/#/admins/success')
                                        } else {
                                            res.redirect('/')
                                        }
                                    })
                                })
                            })
                        } else {
                            res.error(new Error("Passwords mismatch"))
                        }
                    } else {
                        res.error(new Error("Incomplete data"))
                    }
                } else {
                    res.error(new Error("Unauthorized request"), 401)
                }
            })

        })


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
                        logger.warn('Authentication as [' + req.body.username + '] failed from ip: ' + ip + ipsList)
                    }
                    return res.redirect('/')
                }
                req.logIn(user, function(err) {
                    if (err) {
                        return next(err)
                    }
                    return res.redirect('/')
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

            DBHelper.Admin.find({}, function(err, admins) {

                if(err) {
                    return res.error(err)
                }

                status.isFirstLogin = admins.length === 0
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
    }
}

module.exports = AdminsService