var logger      = require("../util/Logger.js").getLogger("menuService")
var DBHelper    = require("../database/Helper.js").DBHelper

function MenuService(app) {
    return function (){
        /**
         * Return a menu
         */
        app.get("/:name", function(req, res) {

            var name = req.param("name")

            DBHelper.Menu.findOne({name: name}, function(err, menu) {
                if(err) {
                    res.error(err)
                } else {
                    res.send(menu)
                }
            })
        })

        /**
         * Create a menu
         */
        app.put("/",function(req,res){
            //TODO : Add integrity data check
            DBHelper.Menu.save(req.body,function(err,menu){
                if(err) {
                    res.error(err)
                } else {
                    res.send(menu)
                }
            })
        })
    }
}

module.exports = MenuService
