
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
    },

    remove: function(objectId, callback) {
        DB.remove("users", objectId, callback)
    }
}

DBHelper.Page = {
    findOne: function(query, options, callback) {

        DB.findOne("pages", query, options, callback)

    },

    findByKey: function(url, options, callback) {

        DB.findOne("pages", {url: url}, options, callback)

    },

    find: function(query, fields_or_options, options_or_callback, callback) {

        DB.find("pages", query, fields_or_options, options_or_callback, callback)

    },

    save: function(obj, callback) {

        if(obj._id) {
            DB.update("pages", {"_id":obj._id}, obj, {safe: true}, callback)
        } else {
            DB.save("pages", obj, callback)
        }
    },

    findAndModify: function(query, sortOrder, update, options, callback) {
        DB.findAndModify("pages", query, sortOrder, update, options, callback)
    },

    remove: function(objectId, callback) {
        DB.remove("pages", objectId, callback)
    }
}

DBHelper.Menu = {
    findOne: function(query, options, callback) {

        DB.findOne("menus", query, options, callback)

    },

    findByKey: function(name, options, callback) {

        DB.findOne("menus", {name: name}, options, callback)

    },

    find: function(query, fields_or_options, options_or_callback, callback) {

        DB.find("menus", query, fields_or_options, options_or_callback, callback)

    },

    save: function(obj, callback) {

        if(obj._id) {
            DB.update("menus", {"_id":obj._id}, obj, {safe: true}, callback)
        } else {
            DB.save("menus", obj, callback)
        }
    },

    findAndModify: function(query, sortOrder, update, options, callback) {
        DB.findAndModify("menus", query, sortOrder, update, options, callback)
    },

    remove: function(objectId, callback) {
        DB.remove("menus", objectId, callback)
    }
}

module.exports = {
    DBHelper: DBHelper,
    Event: new EventEmitter()
}

