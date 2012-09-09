var logger      = require("../util/Logger.js").getLogger("lib.auth.AuthentificationHandler.js")
var PublicApi   = require("./PublicPages.js").PublicApi

function middleware() {
    return function(req, res, next) {
        logger.debug(req.url)

        if(PublicApi.test(req.url)) {
            logger.debug(req.url+ "is public")
            next()
        } else if(req.isAuthenticated()) {
            logger.debug("request is authenticated. proceeding to "+req.url)
            next()
        } else if(/^\/admin(\/.*)?$/.test(req.url)) {
            logger.warn("Unauthorized request")
//            res.send("unauthorized", 403)
            console.log("./login.html")
            res.sendfile(__dirname+"/login.html")
        } else {
            res.error(new Error("Authentication is required"), 403);
        }
    }
}

module.exports = {
    middleware: middleware
}
