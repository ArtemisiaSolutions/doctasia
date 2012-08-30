var logger      = require("../util/Logger.js").getLogger("usersService")
var DBHelper    = require("../database/Helper.js").DBHelper

function WorkersService(app) {

    return function() {
        /**
         * Return every workers
         */
        app.get("/list", function(req, res) {

            DBHelper.Worker.find({}, {sort: [['host','asc']]}, function(err, user) {
                if(err) {
                    res.error(err)
                } else {
                    res.send(user)
                }
            })
        })

        /**
         * Add a new worker
         */
        app.put("/", function(req, res) {

            var worker = req.body

            if(worker) {

                worker.status = "New"

                DBHelper.Worker.save(worker, function(err, savedWorker) {
                    if(err) {
                        res.error(err)
                    } else {
                        res.send(savedWorker)
                    }
                })

            } else {

                res.error(new Error("The body should be a worker object"))

            }
        })

        /**
         * Restore a worker
         */
        app.post("/:hostName/restore", function(req, res) {

            var host = req.param('hostName')

            DBHelper.Worker.findAndModify({host: host}, [['host', 'asc']], {$set: {status: 'Done'}, $unset: {error: 1}}, {'new': true}, function(err, savedWorker) {
                if(err) {
                    res.error(err)
                } else {
                    res.send(savedWorker)
                }
            })
        })

        /**
         * Delete a worker
         */
        app.del("/:hostName", function(req, res) {

            var host = req.param('hostName')
            DBHelper.Worker.findByKey(host, function(err, worker) {
                if(err) {
                    res.error(err)
                } else if(worker) {
                    DBHelper.Worker.remove(worker._id, function(err) {
                        if(err) {
                            res.error(err)
                        } else {
                            res.success()
                        }
                    })
                } else {
                    res.error(new Error("Could not find worker with host ["+host+"]"))
                }
            })
        })
    }
}

module.exports = WorkersService