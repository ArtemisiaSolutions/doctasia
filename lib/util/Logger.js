var util = require('util');

var logger = {}

var red    = '\u001b[31m'
var blue   = '\u001b[34m'
var cyan   = '\u001b[36m'
var green  = '\u001b[32m'
var yellow = '\u001b[33m'
var reset  = '\u001b[0m'

function explodeObject(object) {
    if(util.isError(object)) {

        var str = object.message + "\n" + object.stack
        return str

    } else if(typeof object === "object") {

        return util.inspect(object, false, null)

    } else {

        return object

    }
}

function Writer(file) {

    var recording = false
    var logs = ""


    function logAndRecord(color, type, fileInfo, string) {
        var message = color + '[' + type + ']' + reset + ' [' + fileInfo + '] ' + explodeObject(string)
        if(type === 'DEBUG') {
            console.log(message)
        } else if(type === 'INFO') {
            console.info(message)
        } else if(type === 'ERROR') {
            console.error(message)
        } else if(type === 'WARN') {
            console.warn(message)
        }

        if(recording) {
            if(logs !== "") {
                logs += "\n"
            }
            logs += '[' + type + '] ' + explodeObject(string)
        }
    }

    // TODO: better display if 'message' is an object or error

    var getStackTrace = function(){
        var zero = 0;
        try {(zero)();} catch (e) {
            return  e.stack.replace(/^.*?\n/,'').replace(/(?:\n@:0)?\s+$/m,'').replace(/^\(/gm,'{anon}(').split("\n")
        }
    };

    var getFileInfo = function(){
        var from = getStackTrace()[3]
        return from.replace(/^.*\//, '').replace(/\(/g, '').replace(/\)/g, '')
    }

    this.debug = function(message) {
        logAndRecord(cyan, 'DEBUG', getFileInfo(), message)
    }
    this.info = function(message) {
        logAndRecord(green, 'INFO', getFileInfo(), message)
    }
    this.error = function(message) {
        logAndRecord(red, 'ERROR', getFileInfo(), message)
    }
    this.warn = function(message) {
        logAndRecord(yellow, 'WARN', getFileInfo(), message)
    }

    this.getLogs = function() {
        recording = false
        var res = logs
        logs = ""
        return res
    }

    this.record = function() {
        recording = true
    }
}

logger.getLogger = function(file) {
    return new Writer(file)
}

module.exports = logger
