
var fs = require("fs")

var DEFAULT_CONFIG = {
    "mongodb": {
        "name"              : "doctasia-localhost",
        "host"              : "",
        "port"              : 0,
        "user"              : "",
        "password"          : ""
    }
}


/** Instantiate a config manager to retrieve and set configuration
 *
 * @param configOverride overrides for the configuration.
 */
function ConfigManager(configOverride, defaultConfig, globalConfigDir,fromInstallStep) {
    var self = this

    if(!globalConfigDir) {
        globalConfigDir = process.cwd() + "/config"
    }

    var configFile = globalConfigDir + "/config.json"

    if(!defaultConfig) {
        defaultConfig = DEFAULT_CONFIG
    }

    self.persistedConfig = defaultConfig

    this.loadConfig = function() {

        var dirContent
        try {
            fs.readdirSync(globalConfigDir)
        } catch(err) {
            if(err.code == "ENOENT") {
                fs.mkdirSync(globalConfigDir)
                console.log("Created BuildHub directory ["+globalConfigDir+"]")
            } else {
                throw err
            }
        }

        var content = JSON.stringify(defaultConfig, undefined, 4)
        try {
            content = fs.readFileSync(configFile, "utf8")
        } catch(err) {
            if(err.code == "ENOENT") {
                if(fromInstallStep) {
                    fs.writeFileSync(configFile, content, "utf8")
                    console.log("Created BuildHub configuration file at [" + configFile + "]")
                }else{
                    console.log("Config file [" + configFile + "] not found. Install is needed.")
                    var newInstallError = new Error("NEWINSTALL")
                    throw newInstallError
                }
            } else {
                throw err
            }
        }

        var localConfig = JSON.parse(content)

        self.persistedConfig = merge(defaultConfig, localConfig)

        //console.log(JSON.stringify(self.persistedConfig, null, 4))
    }

    this.saveConfig = function() {
//        console.info("Saving config")
        var content = JSON.stringify(self.persistedConfig, undefined, 4)

//        console.info("content: "+content)
        fs.writeFileSync(configFile, content, "utf8")
    }

    this.getConfig = function(key) {

        if(!key) {
            return self.workingConfig
        }

        var path = key.split(".")

        var value = self.workingConfig

        var breadcrumb = ""
        for(var i = 0 ; i < path.length ; i++) {
            breadcrumb = breadcrumb + path[i]

            if(value) {
                value = value[path[i]]
            } else {
                throw new Error("No such config: ["+breadcrumb+"]")
            }

            breadcrumb = breadcrumb + "."
        }

        return value
    }

    this.setConfig = function(key, newValue) {

//        console.info("Set ["+key+"] to ["+newValue+"]")

        var path = key.split(".")

        var value = self.persistedConfig

        var breadcrumb = ""
        for(var i = 0 ; i < (path.length-1) ; i++) {
            breadcrumb = breadcrumb + path[i]

            if(value[path[i]]) {
                value = value[path[i]]
            } else {
                value[path[i]] = {}
                value = value[path[i]]
            }

            breadcrumb = breadcrumb + "."
        }

        value[path[path.length-1]] = newValue

        self.saveConfig()

        return newValue
    }

    this.setTransientConfig = function(key, newValue) {
        var path = key.split(".")

        var value = self.workingConfig

        var breadcrumb = ""
        for(var i = 0 ; i < (path.length-1) ; i++) {
            breadcrumb = breadcrumb + path[i]

            if(value[path[i]]) {
                value = value[path[i]]
            } else {
                value[path[i]] = {}
                value = value[path[i]]
            }

            breadcrumb = breadcrumb + "."
        }

        value[path[path.length-1]] = newValue
        return newValue
    }

    // load locale config and merge with defaults
    this.loadConfig()

    this.saveConfig() // save after merge so that the user's config file contains new values.

    self.workingConfig = self.persistedConfig

    if(configOverride) {
        self.workingConfig = merge(self.persistedConfig, configOverride)
    }
}

/**
 * Merge 2 objects.
 * @param defaultObj The source object
 * @param overrideObj The object containing data which replace the source object's content
 * @return the merged object
 */
var merge = function(defaultObj, overrideObj) {
    var mergedObj = JSON.parse(JSON.stringify(defaultObj))

    for(var attrName in overrideObj) {
        if(mergedObj[attrName]) {
            if((typeof overrideObj[attrName]) == "object") {
                if((typeof defaultObj[attrName]) == "object") {
                    mergedObj[attrName] = merge(defaultObj[attrName], overrideObj[attrName])
                } else {
                    mergedObj[attrName] = JSON.parse(JSON.stringify(overrideObj[attrName]))
                }
            } else {
                mergedObj[attrName] = overrideObj[attrName]
            }
        } else {
            mergedObj[attrName] = JSON.parse(JSON.stringify(overrideObj[attrName]))
        }
    }

    return mergedObj

}

module.exports = ConfigManager
