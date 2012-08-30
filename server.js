var DBReady     = require("./lib/database/Helper.js").Event


DBReady.on('ready', function(){

    /** ************************************ **/
    /**                EXPRESS               **/
    /** ************************************ **/

    var express         = require("express")
    require('express-namespace')

    var app             = express.createServer()
    var responseError   = require("./lib/util/ResponseError.js")
    var passport        = require("passport")
    var authHandler     = require("./lib/auth/AuthenticationHandler.js")

    app.use(express.methodOverride())
    app.use(express.favicon(__dirname + '/static/img/favicon.ico', { maxAge: 100000000 }))
    app.use('/s', express.static(__dirname + '/static'))
    app.use(express.bodyParser())
    app.use(express.cookieParser())
    app.use(express.session({ secret: 'keyboard cat' }))
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(responseError.middleware())
    app.use(authHandler.middleware())

    app.get('/', function (req, res) {
        res.sendfile("./static/index.html")
    })

    /** ************************************ **/
    /**             NAMESPACES               **/
    /** ************************************ **/
    var UsersService = require("./lib/ws/UsersService.js")

    app.namespace("/users", UsersService(app))


    /** ************************************ **/
    /**              SERVER START            **/
    /** ************************************ **/

    var PORT = 3000
    app.listen(PORT)
    console.log("Listening on http://localhost:"+PORT+"/")
})