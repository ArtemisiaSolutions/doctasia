
var DBHelper            = require("../database/Helper.js").DBHelper
var logger              = require("../util/Logger.js").getLogger("ws.BuildService")

function BuildService(app) {

    return function() {

        /**
         * get latest job
         */
        app.get('/:owner/:repoName/latest', function(req, res) {

            var repoName = req.param("repoName")
            var owner    = req.param("owner")
            var username
            if(req.session && req.session.username) {
                username = req.session.username
            }

            DBHelper.Repository.findOne({name: repoName, 'owner.login': owner}, function(err, repository) {
                if(err) {
                    return res.error(err)

                }

                logger.info("["+username+"] lookup repository ["+owner+"/"+repoName+"]")

                var options = {
                    limit: 1,
                    skip: 0,
                    sort: [
                        [ 'commit.date', 'desc' ]
                    ]
                }

                DBHelper.BuildJob.find({repository: repoName, user: owner}, options, function(err, buildJobs) {

                    if(err) {
                        return res.error(err)
                    }

                    if(buildJobs && buildJobs.length > 0) {
                        res.send(buildJobs[0])
                    } else {
                        res.send(undefined)
                    }

                })
            })
        })
    }
}

module.exports = BuildService
