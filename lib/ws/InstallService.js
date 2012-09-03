var util = require('util');
var installChecker = require("../util/InstallChecker.js")
var ConfigManager   = require("../config/ConfigManager.js")

function InstallService(app) {
    return function (){
        app.get("/", function(req, res){
            res.send(installChecker.installComplete)
        })

        app.post("/", function(req, res){
            var tempConfig = req.body;
            tempConfig.port = parseInt(tempConfig.port)
            var configOverride={mongodb:req.body};
            console.log("Create file with : "+util.inspect(configOverride))
            new ConfigManager(null,configOverride,null,true)

            res.redirect('/')
        })
    }
}

module.exports = InstallService