var ef      = require('./ErrorFormatter.js')
var logger  = require('./Logger.js').getLogger("util.ResponseError")
var ConfigManager   = require('../config/ConfigManager.js')
var installComplete = false;
var confMgr
var InstallAPI={}
InstallAPI.list = [
    /^\/install/
]


function middleware(){
    return function(req, res, next) {
        try{
            confMgr = new ConfigManager()
            installComplete =true;
            next()
        }catch(err){
            if(err.message=="NEWINSTALL"){
                if(InstallAPI.isInstallPages(req.url)){
                    next()
                }else{
                    res.sendfile("./static/install/index.html")
                }
            }else{
                throw err
            }
        }

    }
}

InstallAPI.isInstallPages = function(url){
    var isInstallPages = false
    for(var i = 0 ; i < InstallAPI.list.length ; i++) {
        if(InstallAPI.list[i].test(url)) {
            isInstallPages = true
            break
        }
    }

    if(!isInstallPages) {
        logger.info("[Not Public] "+url)
    }

    return isInstallPages
}

function isInstalled (){
    try{
        confMgr = new ConfigManager()
        return true;
    }catch(err){
        return false;
    }
}

module.exports = {
    middleware: middleware,
    isInstalled: isInstalled
}