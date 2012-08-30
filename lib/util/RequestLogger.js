function middleware() {
    return function(req, res, next) {
        console.info("["+req.session.username+"] "+req.url)
        next()
    }
}

module.exports = {
    middleware: middleware
}
