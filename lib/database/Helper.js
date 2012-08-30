
var DB           = require("./DB.js").DB
var Ready        = require("./DB.js").Event
var ParallelRunner  = require("serial").ParallelRunner
var EventEmitter    = require('events').EventEmitter
var logger          = require('../util/Logger.js').getLogger('Helper')

var DBHelper = {}

Ready.on('ready', function(){
    logger.info('App database is ready')
    module.exports.Event.emit('ready')
})

DBHelper.User = {
    findOne: function(query, options, callback) {

        DB.findOne("users", query, options, callback)

    },

    findByKey: function(login, options, callback) {

        DB.findOne("users", {login: login}, options, callback)

    },

    find: function(query, fields_or_options, options_or_callback, callback) {

        DB.find("users", query, fields_or_options, options_or_callback, callback)

    },

    save: function(obj, callback) {

        if(obj._id) {
            DB.update("users", {"_id":obj._id}, obj, {safe: true}, callback)
        } else {
            DB.save("users", obj, callback)
        }
    },

    findAndModify: function(query, sortOrder, update, options, callback) {
        DB.findAndModify("users", query, sortOrder, update, options, callback)
    }
}

DBHelper.BuildJob = {
    findOne: function(query, options, callback) {

        DB.findOne("buildjobs", query, options, callback)

    },

    findByKey: function(commitSha, options, callback) {

        DB.findOne("buildjobs", {commitSha: commitSha}, options, callback)

    },

    find: function(query, fields_or_options, options_or_callback, callback) {

        DB.find("buildjobs", query, fields_or_options, options_or_callback, callback)

    },

    save: function(obj, callback) {

        if(obj._id) {
            DB.update("buildjobs", {"_id":obj._id}, obj, {safe: true}, callback)
        } else {
            DB.save("buildjobs", obj, callback)
        }

    }
}

DBHelper.Repository = {
    findOne: function(query, options, callback) {

        DB.findOne("repositories", query, options, callback)

    },

    findByKey: function(owner, name, options, callback) {

        DB.findOne("repositories", {'owner.login': owner, name: name}, options, callback)

    },

    find: function(query, fields_or_options, options_or_callback, callback) {

        DB.find("repositories", query, fields_or_options, options_or_callback, callback)

    },

    save: function(obj, callback) {

        if(obj._id) {
            console.info("Object to save already has an _id. updating the existing one")
            DB.update("repositories", {"_id": obj._id}, obj, {safe: true}, callback)
        } else if(Array.isArray(obj)) {
            var r = new ParallelRunner()

            for(var i = 0 ; i < obj.length ; i++) {
                console.info("Batching item for save")
                r.add(this.save, obj[i]) // recurse but with object
            }

            r.run(function(results) {

                if(!results) results = []
                console.info("Batch save returned with ["+JSON.stringify(results)+"] results")

                var savedRepositories = []
                var errors = []

                for(var i = 0 ; i < results.length ; i++) {
                    if(results[i][0]) {// first param is error
                        console.error("Error saving repository: "+results[i][0])
                        errors.push(results[i][0])
                    } else {
                        savedRepositories.push(results[i][1]) // second param is saved object
                    }
                }

                if(errors.length > 0) {
                    console.error("["+errors.length+"] errors while saving repositories")
                    callback(errors, undefined)
                } else {
                    callback(undefined, savedRepositories)
                }
            })

        } else {
            console.info("Object to save does not have an _id. Saving the new object")
            DB.save("repositories", obj, callback)
        }

    },
    
    findAndModify: function(query, sortOrder, update, options, callback) {
        DB.findAndModify("repositories", query, sortOrder, update, options, callback)
    }
}

DBHelper.Work_queue = {
    findOne: function(query, options, callback) {

        DB.findOne("work_queue", query, options, callback)

    },

    findByKey: function(commitSha, user, options, callback) {

        DB.findOne("work_queue", {commitSha: commitSha, user: user}, options, callback)

    },

    find: function(query, fields_or_options, options_or_callback, callback) {

        DB.find("work_queue", query, fields_or_options, options_or_callback, callback)

    },

    update: function(query, obj, options, callback) {

        DB.update("work_queue", query, obj, options, callback)
    
    },
    
    save: function(obj, callback) {
        
        if(obj._id) {
            DB.update("work_queue", {"_id":obj._id}, obj, {safe: true}, callback)
        } else {
            DB.save("work_queue", obj, callback)
        }
    },
    
    findAndModify: function(query, sortOrder, update, options, callback) {
        DB.findAndModify("work_queue", query, sortOrder, update, options, callback)
    }
}

DBHelper.Work_queue_archive = {
    findOne: function(query, options, callback) {

        DB.findOne("work_queue_archive", query, options, callback)

    },

    findByKey: function(commitSha, user, options, callback) {

        DB.findOne("work_queue_archive", {commitSha: commitSha, user: user}, options, callback)

    },

    find: function(query, fields_or_options, options_or_callback, callback) {

        DB.find("work_queue_archive", query, fields_or_options, options_or_callback, callback)

    },

    update: function(query, obj, options, callback) {

        DB.update("work_queue_archive", query, obj, options, callback)

    },

    save: function(obj, callback) {

        if(obj._id) {
            DB.update("work_queue_archive", {"_id":obj._id}, obj, {safe: true}, callback)
        } else {
            DB.save("work_queue_archive", obj, callback)
        }
    },

    findAndModify: function(query, sortOrder, update, options, callback) {
        DB.findAndModify("work_queue_archive", query, sortOrder, update, options, callback)
    }
}

DBHelper.Commit = {
    findOne: function(query, options, callback) {

        DB.findOne("commit", query, options, callback)

    },

    findByKey: function(repoName, sha, options, callback) {

        DB.findOne("commit", {repoName: repoName, sha: sha}, options, callback)

    },

    find: function(query, fields_or_options, options_or_callback, callback) {

        DB.find("commit", query, fields_or_options, options_or_callback, callback)

    },
    
    update: function(query, obj, options, callback) {

        DB.update("commit", query, obj, options, callback)
    
    },

    save: function(obj, callback) {
        if(obj._id) {
            console.info("Object to save already has an _id. updating the existing one")
            DB.update("commit", {"_id":obj._id}, obj, {safe: true}, callback)
        } else if(Array.isArray(obj)) {
            var r = new ParallelRunner()

            for(var i = 0 ; i < obj.length ; i++) {
                console.info("Batching item for save")
                r.add(this.save, obj[i]) // recurse but with object
            }

            r.run(function(results) {

                if(!results) results = []

                console.info("Batch save returned with ["+JSON.stringify(results)+"] results")

                var savedCommits = []
                var errors = []

                for(var i = 0 ; i < results.length ; i++) {
                    if(results[i][0]) {// first param is error
                        console.error("Error saving commit: "+results[i][0])
                        errors.push(results[i][0])
                    } else {
                        savedCommits.push(results[i][1]) // second param is saved object
                    }
                }

                if(errors.length > 0) {
                    console.error("["+errors.length+"] errors while saving commits")
                    callback(errors, undefined)
                } else {
                    callback(undefined, savedCommits)
                }
            })

        } else {
            console.info("Object to save does not have an _id. Saving the new object")
            DB.save("commit", obj, callback)
        }
    },
    
    findAndModify: function(query, sortOrder, update, options, callback) {
        DB.findAndModify("commit", query, sortOrder, update, options, callback)
    }
}

DBHelper.Ssh = {
    findOne: function(query, options, callback) {

        DB.findOne("ssh", query, options, callback)

    },

    findByKey: function(owner, repoName, options, callback) {
        DB.findOne("ssh", {'repository.owner.login': owner, 'repository.name': repoName}, options, callback)

    },

    find: function(query, fields_or_options, options_or_callback, callback) {

        DB.find("ssh", query, fields_or_options, options_or_callback, callback)

    },

    update: function(query, obj, options, callback) {

        DB.update("ssh", query, obj, options, callback)

    },

    save: function(obj, callback) {

    	if(obj._id) {
            DB.update("ssh", {"_id":obj._id}, obj, {safe: true}, callback)
        } else {
            DB.save("ssh", obj, callback)
        }
    }
}

DBHelper.Worker = {
    findOne: function(query, options, callback) {

        DB.findOne("worker", query, options, callback)

    },

    findByKey: function(host, options, callback) {

        DB.findOne("worker", {'host': host}, options, callback)

    },

    find: function(query, fields_or_options, options_or_callback, callback) {

        DB.find("worker", query, fields_or_options, options_or_callback, callback)

    },

    update: function(query, obj, options, callback) {

        DB.update("worker", query, obj, options, callback)

    },

    save: function(obj, callback) {

        if(obj._id) {
            DB.update("worker", {"_id":obj._id}, obj, {safe: true}, callback)
        } else {
            DB.save("worker", obj, callback)
        }
    },

    findAndModify: function(query, sortOrder, update, options, callback) {
        DB.findAndModify("worker", query, sortOrder, update, options, callback)
    },

    remove: function(objectId, callback) {
        DB.remove("worker", objectId, callback)
    }
}

module.exports = {
    DBHelper: DBHelper,
    Event: new EventEmitter()
}

