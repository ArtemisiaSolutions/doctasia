
var AppDB           = require("./DB.js").AppDB
var AdminDB         = require("./DB.js").AdminDB
var AppReady        = require("./DB.js").AppEvent
var AdminReady      = require("./DB.js").AdminEvent
var ParallelRunner  = require("serial").ParallelRunner
var EventEmitter    = require('events').EventEmitter
var logger          = require('../util/Logger.js').getLogger('Helper')

var DBHelper = {}

var appReady = false
var adminReady = false


AppReady.on('ready', function(){
    logger.info('App database is ready')
    appReady = true
    if(adminReady) {
        module.exports.Event.emit('ready')
    }
})

AdminReady.on('ready', function(){
    logger.info('Admin database is ready')
    adminReady = true
    if(appReady) {
        module.exports.Event.emit('ready')
    }
})

DBHelper.User = {
    findOne: function(query, options, callback) {

        AppDB.findOne("users", query, options, callback)

    },

    findByKey: function(login, options, callback) {

        AppDB.findOne("users", {login: login}, options, callback)

    },

    find: function(query, fields_or_options, options_or_callback, callback) {

        AppDB.find("users", query, fields_or_options, options_or_callback, callback)

    },

    save: function(obj, callback) {

        if(obj._id) {
            AppDB.update("users", {"_id":obj._id}, obj, {safe: true}, callback)
        } else {
            AppDB.save("users", obj, callback)
        }
    },

    findAndModify: function(query, sortOrder, update, options, callback) {
        AppDB.findAndModify("users", query, sortOrder, update, options, callback)
    }
}

DBHelper.BuildJob = {
    findOne: function(query, options, callback) {

        AppDB.findOne("buildjobs", query, options, callback)

    },

    findByKey: function(commitSha, options, callback) {

        AppDB.findOne("buildjobs", {commitSha: commitSha}, options, callback)

    },

    find: function(query, fields_or_options, options_or_callback, callback) {

        AppDB.find("buildjobs", query, fields_or_options, options_or_callback, callback)

    },

    save: function(obj, callback) {

        if(obj._id) {
            AppDB.update("buildjobs", {"_id":obj._id}, obj, {safe: true}, callback)
        } else {
            AppDB.save("buildjobs", obj, callback)
        }

    }
}

DBHelper.Repository = {
    findOne: function(query, options, callback) {

        AppDB.findOne("repositories", query, options, callback)

    },

    findByKey: function(owner, name, options, callback) {

        AppDB.findOne("repositories", {'owner.login': owner, name: name}, options, callback)

    },

    find: function(query, fields_or_options, options_or_callback, callback) {

        AppDB.find("repositories", query, fields_or_options, options_or_callback, callback)

    },

    save: function(obj, callback) {

        if(obj._id) {
            console.info("Object to save already has an _id. updating the existing one")
            AppDB.update("repositories", {"_id": obj._id}, obj, {safe: true}, callback)
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
            AppDB.save("repositories", obj, callback)
        }

    },
    
    findAndModify: function(query, sortOrder, update, options, callback) {
        AppDB.findAndModify("repositories", query, sortOrder, update, options, callback)
    }
}

DBHelper.Work_queue = {
    findOne: function(query, options, callback) {

        AppDB.findOne("work_queue", query, options, callback)

    },

    findByKey: function(commitSha, user, options, callback) {

        AppDB.findOne("work_queue", {commitSha: commitSha, user: user}, options, callback)

    },

    find: function(query, fields_or_options, options_or_callback, callback) {

        AppDB.find("work_queue", query, fields_or_options, options_or_callback, callback)

    },

    update: function(query, obj, options, callback) {

        AppDB.update("work_queue", query, obj, options, callback)
    
    },
    
    save: function(obj, callback) {
        
        if(obj._id) {
            AppDB.update("work_queue", {"_id":obj._id}, obj, {safe: true}, callback)
        } else {
            AppDB.save("work_queue", obj, callback)
        }
    },
    
    findAndModify: function(query, sortOrder, update, options, callback) {
        AppDB.findAndModify("work_queue", query, sortOrder, update, options, callback)
    }
}

DBHelper.Work_queue_archive = {
    findOne: function(query, options, callback) {

        AppDB.findOne("work_queue_archive", query, options, callback)

    },

    findByKey: function(commitSha, user, options, callback) {

        AppDB.findOne("work_queue_archive", {commitSha: commitSha, user: user}, options, callback)

    },

    find: function(query, fields_or_options, options_or_callback, callback) {

        AppDB.find("work_queue_archive", query, fields_or_options, options_or_callback, callback)

    },

    update: function(query, obj, options, callback) {

        AppDB.update("work_queue_archive", query, obj, options, callback)

    },

    save: function(obj, callback) {

        if(obj._id) {
            AppDB.update("work_queue_archive", {"_id":obj._id}, obj, {safe: true}, callback)
        } else {
            AppDB.save("work_queue_archive", obj, callback)
        }
    },

    findAndModify: function(query, sortOrder, update, options, callback) {
        AppDB.findAndModify("work_queue_archive", query, sortOrder, update, options, callback)
    }
}

DBHelper.Commit = {
    findOne: function(query, options, callback) {

        AppDB.findOne("commit", query, options, callback)

    },

    findByKey: function(repoName, sha, options, callback) {

        AppDB.findOne("commit", {repoName: repoName, sha: sha}, options, callback)

    },

    find: function(query, fields_or_options, options_or_callback, callback) {

        AppDB.find("commit", query, fields_or_options, options_or_callback, callback)

    },
    
    update: function(query, obj, options, callback) {

        AppDB.update("commit", query, obj, options, callback)
    
    },

    save: function(obj, callback) {
        if(obj._id) {
            console.info("Object to save already has an _id. updating the existing one")
            AppDB.update("commit", {"_id":obj._id}, obj, {safe: true}, callback)
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
            AppDB.save("commit", obj, callback)
        }
    },
    
    findAndModify: function(query, sortOrder, update, options, callback) {
        AppDB.findAndModify("commit", query, sortOrder, update, options, callback)
    }
}

DBHelper.Ssh = {
    findOne: function(query, options, callback) {

        AppDB.findOne("ssh", query, options, callback)

    },

    findByKey: function(owner, repoName, options, callback) {
        AppDB.findOne("ssh", {'repository.owner.login': owner, 'repository.name': repoName}, options, callback)

    },

    find: function(query, fields_or_options, options_or_callback, callback) {

        AppDB.find("ssh", query, fields_or_options, options_or_callback, callback)

    },

    update: function(query, obj, options, callback) {

        AppDB.update("ssh", query, obj, options, callback)

    },

    save: function(obj, callback) {

    	if(obj._id) {
            AppDB.update("ssh", {"_id":obj._id}, obj, {safe: true}, callback)
        } else {
            AppDB.save("ssh", obj, callback)
        }
    }
}

DBHelper.Worker = {
    findOne: function(query, options, callback) {

        AppDB.findOne("worker", query, options, callback)

    },

    findByKey: function(host, options, callback) {

        AppDB.findOne("worker", {'host': host}, options, callback)

    },

    find: function(query, fields_or_options, options_or_callback, callback) {

        AppDB.find("worker", query, fields_or_options, options_or_callback, callback)

    },

    update: function(query, obj, options, callback) {

        AppDB.update("worker", query, obj, options, callback)

    },

    save: function(obj, callback) {

        if(obj._id) {
            AppDB.update("worker", {"_id":obj._id}, obj, {safe: true}, callback)
        } else {
            AppDB.save("worker", obj, callback)
        }
    },

    findAndModify: function(query, sortOrder, update, options, callback) {
        AppDB.findAndModify("worker", query, sortOrder, update, options, callback)
    },

    remove: function(objectId, callback) {
        AppDB.remove("worker", objectId, callback)
    }
}

DBHelper.Admin = {
    findOne: function(query, options, callback) {

        AdminDB.findOne("admin", query, options, callback)

    },

    findByKey: function(host, options, callback) {

        AdminDB.findOne("admin", {'host': host}, options, callback)

    },

    find: function(query, fields_or_options, options_or_callback, callback) {

        AdminDB.find("admin", query, fields_or_options, options_or_callback, callback)

    },

    update: function(query, obj, options, callback) {

        AdminDB.update("admin", query, obj, options, callback)

    },

    save: function(obj, callback) {

        if(obj._id) {
            AdminDB.update("admin", {"_id":obj._id}, obj, {safe: true}, callback)
        } else {
            AdminDB.save("admin", obj, callback)
        }
    },

    findAndModify: function(query, sortOrder, update, options, callback) {
        AdminDB.findAndModify("admin", query, sortOrder, update, options, callback)
    },

    remove: function(objectId, callback) {
        AdminDB.remove("admin", objectId, callback)
    }
}
module.exports = {
    DBHelper: DBHelper,
    Event: new EventEmitter()
}

