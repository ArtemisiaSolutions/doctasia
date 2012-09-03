    /** ************************************ **/
    /**                EXPRESS               **/
    /** ************************************ **/

    var express         = require("express")
    require('express-namespace')

    var app             = express.createServer()
    var responseError   = require("./lib/util/ResponseError.js")
    var passport        = require("passport")
    var authHandler     = require("./lib/auth/AuthenticationHandler.js")
    var installChecker    = require("./lib/util/InstallChecker.js")
//    var DBReady     = require("./lib/database/Helper.js").Event

    app.use(express.methodOverride())
    app.use(express.favicon(__dirname + '/static/img/favicon.ico', { maxAge: 100000000 }))
    app.use('/s', express.static(__dirname + '/static'))
    app.use(express.bodyParser())
    app.use(installChecker.middleware())
    app.use(express.cookieParser())
    app.use(express.session({ secret: 'doctasia wikipedia' }))
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
    var InstallService = require("./lib/ws/InstallService.js")
    app.namespace("/install", InstallService(app))


    if(installChecker.isInstalled()){
        console.log("Install seems to be complete")
        var UsersService = require("./lib/ws/UsersService.js")
        var PagesService = require("./lib/ws/PagesService.js")
        var MenuService = require("./lib/ws/MenuService.js")

        app.namespace("/user", UsersService(app))
        app.namespace("/page", PagesService(app))
        app.namespace("/menu", MenuService(app))
    }

    /** ************************************ **/
    /**              SERVER START            **/
    /** ************************************ **/

    var PORT = 3000
    app.listen(PORT)
    console.log("Listening on http://localhost:"+PORT+"/")