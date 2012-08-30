var logger      = require("../util/Logger.js").getLogger("usersService")
var DBHelper    = require("../database/Helper.js").DBHelper

function UsersService(app) {

    return function() {

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
         * Update a user
         */
        app.post("/setUserAdmin", function(req, res) {

            var login = req.body.login
            var isAdmin = req.body.isAdmin === "true" ? "Admin" : "User"

            DBHelper.User.findAndModify({login: login}, [['login', 'asc']], {$set: {role: isAdmin}}, {'new':true}, function(err, savedUser) {
                if(err) {
                    res.error(err)
                } else {
                    res.send(savedUser)
                }
            })
        })

        /**
         * Update a user
         */
        app.post("/updateSubscription", function(req, res) {

            var login = req.body.login
            var subscription = req.body.subscription

            subscription.isActive = subscription.isActive === "true"

            DBHelper.User.findAndModify({login: login}, [['login', 'asc']], {$set: {subscription: subscription}}, {'new':true}, function(err, savedUser) {
                if(err) {
                    res.error(err)
                } else {
                    res.send(savedUser)
                }
            })
        })

        /**
         * Return every repositories user 'login' can write
         */
        app.get("/user/:login/repositories", function(req, res) {

            var login = req.param("login")
            var query = {$or: [{'owner.login': login}, {'users.canWrite': login}, {'users.canRead': login}]}


            DBHelper.Repository.find(query, {sort: [['owner.login','asc'], ['name','asc']]}, function(err, repositories) {

                if(err) return res.error(err)

                res.send(repositories)

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