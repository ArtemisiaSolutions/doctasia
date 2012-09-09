var logger      = require("../util/Logger.js").getLogger()
var DBHelper    = require("../database/Helper.js").DBHelper

function PagesService(app) {

    return function() {

        /**
         * Return a lightweight list of pages
         */
        // TODO: add pagination
        app.post("/list", function(req, res) {

            var pagesQueryOptions = {
                'sort': [['name', 'asc']],
                fields: ["name", "url"]
            }
            logger.info("Retrieving all pages")

            DBHelper.Page.find({}, pagesQueryOptions, function(err, pages) {
                if(err) {
                    res.error(err)
                } else {
                    res.send(pages)
                }
            })
        })

        /**
         * Return a page
         */
        app.get("/:url", function(req, res) {

            var url = req.param("url")

            logger.info("Retrieving page ["+url+"]")

            DBHelper.Page.findOne({ url: url }, function(err, page) {
                if(err) {
                    res.error(err)
                } else {
                    res.send(page)
                }
            })
        })

        /**
         * Create or save a page
         */
        app.put("/", function(req, res) {

            var page = req.body

            console.log("Saving page: "+JSON.stringify(page, null, 2))

            if(!page.name) {
                var err = new Error("Page 'name' is required")
                return res.error(err)
            }
            if(!page.url) {
                var err = new Error("Page 'url' is required")
                return res.error(err)
            }

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