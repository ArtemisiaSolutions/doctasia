var logger = require("../util/Logger.js").getLogger("config.SecurityConfig")

var PublicApi = {}
PublicApi.list = [
    /^\/$/,
    /^\/admin\/login$/,
    /^\/admin$/
]

PublicApi.test = function(url) {
    var isPublic = false
    for(var i = 0 ; i < PublicApi.list.length ; i++) {
        if(PublicApi.list[i].test(url)) {
            isPublic = true
            break
        }
    }

    if(!isPublic) {
        logger.info("[Not Public] "+url)
    }

    return isPublic
}

module.exports = {PublicApi: PublicApi}