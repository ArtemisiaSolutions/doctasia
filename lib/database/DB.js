var mongo           = require('mongodb')
var logger          = require('../util/Logger.js').getLogger()
var EventEmitter    = require('events').EventEmitter
var ParallelRunner  = require('serial').ParallelRunner
var ConfigManager   = require('../config/ConfigManager.js')

var confMgr = new ConfigManager()

Provider = function(name, host, port, user, password, callback) {
    var self = this

    this.db = new mongo.Db(name, new mongo.Server(host, port, {auto_reconnect : true, poolSize : 30}), {native_parser:false})

    this.db.open(function(err) {

        if (err) throw(err)

        self.db.authenticate(user, password, function(err, result) {

            if (err) throw err

            logger.info("authentication: "+result)
            callback()

        })
    })

    var collections = {}

    /**
     *
     * @param name the collection name
     * @param indexes any indexes to set on the collection. See doc on indexes here: (http://christkv.github.com/node-mongodb-native)
     */
    this.loadCollection = function(name, indexes_or_callback, callback) {

        var indexes
        if(!callback) {
            callback = indexes_or_callback
        } else {
            indexes = indexes_or_callback
        }

        logger.info('Loading collection ['+name+']')

        self.db.collection(name, function(err, collection) {

            if (err) throw err

            collections[name] = collection
            logger.info('Collection ['+name+'] loaded')


            if(indexes && indexes.length > 0) {

                for(var i = 0 ; i < indexes.length ; i++) {

                    collection.ensureIndex(indexes[i].index, indexes[i].options, function(err, indexName) {

                        if (err) throw err

                        logger.debug("Created index [" + indexName + "] on collection ["+name+"]")

                        if(callback) {
                            callback()
                        }
                    })

                }
            } else {
                if(callback) {
                    callback()
                }
            }
        })
    }

    /**
     *
     * @param collection the collection name in which to save the object
     * @param obj the object to insert or update
     * @param callback (err, obj)
     */
    this.update = function(collection, selector, document, optionsOrCallback, callback) {

        if(collections[collection]) {

            logger.debug(collection+".update("+JSON.stringify(selector)+", "+JSON.stringify(document)+", "+JSON.stringify(optionsOrCallback)+")")


            if(!callback) {

                callback = optionsOrCallback

                optionsOrCallback = {}

            }

            optionsOrCallback.safe = true

            collections[collection].update(selector, document, optionsOrCallback, function(err, savedDocument) {

                if(err) return callback(err, undefined)

                if(savedDocument === 1) {
                    callback(undefined, document)
                } else {
                    callback(undefined, savedDocument)
                }

            })

        } else {

            var err = new Error("No collection with name ["+collection+"]")

            if(callback) callback(err, undefined)
            else optsOrCallback(err, undefined)

        }
    }

    /**
     *
     * @param collection the collection name in which to save the object
     * @param obj the object to insert or update
     * @param callback (err, obj)
     */
    this.save = function(collection, document, callback) {

        if(collections[collection]) {

            logger.debug(collection+".save("+JSON.stringify(document)+", {safe: true})")


            collections[collection].save(document, {safe: true}, function(err, result) {

                if(err) return callback(err, undefined)

                if(result === 1) callback(undefined, document)

                else callback(undefined, result)

            })

        } else {

            var err = new Error("No collection with name ["+collection+"]")

            callback(err, undefined)

        }
    }

    /**
     *
     * @param collection the collection name in which to save the object
     * @param query the search query
     * @param options search options
     * @param callback (err, obj)
     */
    this.findOne = function(collection, query, optsOrCallback, callback) {

        if(collections[collection]) {

            if(callback) {

                logger.debug(collection+".findOne("+JSON.stringify(query)+", "+JSON.stringify(optsOrCallback)+")")

                collections[collection].findOne(query, optsOrCallback, callback)

            } else {

                logger.debug(collection+".findOne("+JSON.stringify(query)+")")

                collections[collection].findOne(query, optsOrCallback)

            }

        } else {

            var err = new Error("No collection with name ["+collection+"]")
            if(callback) callback(err, undefined)
            else optsOrCallback(err, undefined)

        }
    }

    /**
     *
     * @param collection the collection name in which to save the object
     * @param query the search query
     * @param options search options
     * @param callback (err, obj)
     */
    this.find = function(collection, query, fields_or_options_or_callback, options_or_callback, callback) {

        if(collections[collection]) {

            if(callback) {

                logger.debug(collection+".find("+JSON.stringify(query)+", "+JSON.stringify(fields_or_options_or_callback)+", "+JSON.stringify(options_or_callback)+")")

                collections[collection].find(query, fields_or_options_or_callback, options_or_callback).toArray(callback)

            } else if(options_or_callback) {

                logger.debug(collection+".find("+JSON.stringify(query)+")")

                collections[collection].find(query, fields_or_options_or_callback).toArray(options_or_callback)

            } else {

                logger.debug(collection+".find("+JSON.stringify(query)+")")

                collections[collection].find(query).toArray(fields_or_options_or_callback)

            }

        } else {

            var err = new Error("No collection with name ["+collection+"]")

            if(callback) callback(err, undefined)
            else if(options_or_callback) options_or_callback(err, undefined)
            else if(fields_or_options_or_callback) fields_or_options_or_callback(err, undefined)
            else throw new Error("Missing mandatory callback argument")

        }
    }

    /**
     *
     * @param collection the collection name in which to save the object
     * @param query the search query
     * @param sortOrder order of the matches
     * @param update replacement object
     * @param optsOrCallback search options
     * @param callback (err, obj)
     */
    this.findAndModify = function(collection, query, sortOrder, update, optsOrCallback, callback) {

        if(collections[collection]) {

            if(callback) {

                logger.debug(collection+".findAndModify("+JSON.stringify(query)+", "+JSON.stringify(optsOrCallback)+")")

                collections[collection].findAndModify(query, sortOrder, update, optsOrCallback, callback)

            } else {

                logger.debug(collection+".findAndModify("+JSON.stringify(query)+")")

                collections[collection].findAndModify(query, sortOrder, update, optsOrCallback)

            }

        } else {

            var err = new Error("No collection with name ["+collection+"]")

            if(callback) callback(err, undefined)
            else optsOrCallback(err, undefined)

        }
    }

    /** Great power come with great responsiblity
     *
     * @param collection the collection name in which to delete the object
     * @param query the delete query
     * @param callback (err, obj)
     */
    this.remove = function(collection, objectId, callback) {

        if(collections[collection]) {

            logger.debug(collection+".remove("+JSON.stringify({_id: objectId}))


            collections[collection].remove({_id: objectId}, function(err, result) {

                if(err) return callback(err, undefined)

                if(result === 1) callback(undefined, document)

                else callback(undefined, result)

            })

        } else {

            var err = new Error("No collection with name ["+collection+"]")

            callback(err, undefined)

        }
    }
}


/* User
 {
 plan: {
 name: 'micro',
 collaborators: 1,
 space: 614400,
 private_repos: 5
 },
 gravatar_id: '93e1240529de2f0a28ae50d814204b9a',
 company: 'Goellan',
 name: 'Nicolas Herment',
 created_at: '2011/09/10 14:49:14 -0700',
 location: 'Paris, France',
 disk_usage: 5228,
 collaborators: 0,
 public_repo_count: 9,
 public_gist_count: 5,
 blog: '',
 following_count: 0,
 id: 1041426,
 owned_private_repo_count: 4,
 private_gist_count: 0,
 type: 'User',
 permission: null,
 total_private_repo_count: 4,
 followers_count: 2,
 login: 'nherment',
 email: '',
 emails: []
 }
 *
 */


var dbProvider = new Provider(confMgr.getConfig("mongodb.name"),
    confMgr.getConfig("mongodb.host"),
    confMgr.getConfig("mongodb.port"),
    confMgr.getConfig("mongodb.user"),
    confMgr.getConfig("mongodb.password"),
    function() {

        var runner = new ParallelRunner()

        dbProvider.loadCollection( 'users', [
            { index: {'login': 1}, options: {unique: true} }
        ], function() {
            module.exports.Event.emit('ready')
        })

        dbProvider.loadCollection( 'pages',
            { index: {'url': 1, 'name': 1}, options: {unique: true} },
            function() {

        })

        dbProvider.loadCollection( 'menus',
            { index: {'name': 1}, options: {unique: true} },
            function() {

        })

    })

module.exports = {
    DB: dbProvider,
    Event: new EventEmitter()
}


