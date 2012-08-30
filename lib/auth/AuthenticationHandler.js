var logger      = require("../util/Logger.js").getLogger("lib.auth.AuthentificationHandler.js")
var PublicApi   = require("./PublicPages.js").PublicApi

function middleware() {
    return function(req, res, next) {
        logger.debug(req.url)
        if(req.isAuthenticated() || PublicApi.test(req.url)) {
            next()
        } else {
            logger.warn("Unauthorized request")
            res.send({_error: "User not authenticated"}, 401)
        }
    }
}

module.exports = {
    middleware: middleware
}
