var logger      = require("../util/Logger.js").getLogger()
var DBHelper    = require("../database/Helper.js").DBHelper

function PagesService(app) {

    return function() {

        /**
         * Return a page
         */
        app.get("/:url", function(req, res) {

            var url = req.param("url")

            DBHelper.Page.findOne({ url: url }, function(err, page) {
                if(err) {
                    res.error(err)
                } else {
                    res.send(page)
                }
            })
        })

        /**
         * Create a page
         */
        app.put("/", function(req, res) {

            var page = req.body

            DBHelper.Page.save(page, function(err, savedPage) {
                if(err) {
                    res.error(err)
                } else {
                    res.send(savedPage)
                }
            })
        })
    }
}

module.exports = PagesService