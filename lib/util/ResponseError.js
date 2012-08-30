var ef      = require('./ErrorFormatter.js')
var logger  = require('./Logger.js').getLogger("util.ResponseError")

function error(err, httpCode) {

    logger.error(err)

    if(!httpCode) {
        httpCode = 400
    }

    // TODO: adapt response code based on error code
    this.send(ef.format(err), httpCode)

}

function success() {

    this.send({result: success}, 200)

}

function middleware() {
    return function(req, res, next) {

        if(!res.success) {

            res.success = success

        } else {

            throw new Error("Could not augment HTTP response object with success() method because response.success already exists")

        }

        if(!res.error) {

            res.error = error

        } else {

            throw new Error("Could not augment HTTP response object with error() method because response.error already exists")

        }

        next()
    }
}

module.exports = {
    middleware: middleware
}
