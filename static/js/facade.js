var Facade = {}


/** ************************************ **/
/**                USERS                 **/
/** ************************************ **/


Facade.getUser = function(login, callback) {
    $.get("/users/user/"+login, function(result) {
        if(result && result._error) {
            callback(new Error(result._error), undefined)
        } else {
            callback(undefined, result)
        }
    })
}

Facade.getUsers = function(callback) {
    $.get("/users/getUsers", function(result) {
        if(result && result._error) {
            callback(new Error(result._error), undefined)
        } else {
            callback(undefined, result)
        }
    })
}

Facade.setUserAdmin = function(login, isAdmin, callback) {
    $.post("/users/setUserAdmin", {login: login, isAdmin: isAdmin}, function(result) {
        if(result && result._error) {
            callback(new Error(result._error), undefined)
        } else {
            callback(undefined, result)
        }
    })
}

Facade.updateSubscription = function(login, subscription, callback) {
    $.post("/users/updateSubscription", {login: login, subscription: subscription}, function(result) {
        if(result && result._error) {
            callback(new Error(result._error), undefined)
        } else {
            callback(undefined, result)
        }
    })
}

Facade.getRepositoriesForUser = function(login, callback) {
    $.get("/users/user/"+login+"/repositories", function(result) {
        if(result && result._error) {
            callback(new Error(result._error), undefined)
        } else {
            callback(undefined, result)
        }
    })
}

Facade.searchForUser = function(login, callback) {
    $.post("/users/search", {login: login}, function(result) {
        if(result && result._error) {
            callback(new Error(result._error), undefined)
        } else {
            callback(undefined, result)
        }
    })
}


Facade.getLastBuildJob = function(owner, repoName, callback) {
    $.get("/build/" + owner + "/" + repoName + "/latest", function(result) {
        if(result && result._error) {
            callback(new Error(result._error), undefined)
        } else {
            callback(undefined, result)
        }
    })
}

/** ************************************ **/
/**               WORKERS                **/
/** ************************************ **/

Facade.getWorkers = function(callback) {
    $.get("/workers/list", function(result) {
        if(result && result._error) {
            callback(new Error(result._error), undefined)
        } else {
            callback(undefined, result)
        }
    })
}

Facade.addWorker = function(worker, callback) {
    $.ajax({
        url: "/workers",
        type: "PUT",
        data: JSON.stringify(worker),
        contentType: "application/json",
        success: function(result) {
            if(result && result._error) {
                callback(new Error(result._error), undefined)
            } else {
                callback(undefined, result)
            }
        },
        error: function(err) {
            callback(err, undefined)
        }
    })
}

Facade.restoreWorker = function(host, callback) {
    $.ajax({
        url: "/workers/"+host+"/restore",
        type: "POST",
        data: "{}",
        contentType: "application/json",
        success: function(result) {
            if(result && result._error) {
                callback(new Error(result._error), undefined)
            } else {
                callback(undefined, result)
            }
        },
        error: function(err) {
            callback(err, undefined)
        }
    })
}

Facade.deleteWorker = function(host, callback) {
    $.ajax({
        url: "/workers/"+host+"",
        type: "DELETE",
        data: "{}",
        contentType: "application/json",
        success: function(result) {
            if(result && result._error) {
                callback(new Error(result._error), undefined)
            } else {
                callback(undefined, result)
            }
        },
        error: function(err) {
            callback(err, undefined)
        }
    })
}

/** ************************************ **/
/**                ADMIN                 **/
/** ************************************ **/

Facade.getLoginStatus = function(callback) {
    $.get("/admins/status", function(result) {
        if(result && result._error) {
            callback(new Error(result._error), undefined)
        } else {
            callback(undefined, result)
        }
    })
}

Facade.createAdmin = function(name, pass1, pass2, callback) {
    var admin = {
        name: name,
        pass1: pass1,
        pass2: pass2
    }
    $.ajax({
        url: "/admins",
        type: "PUT",
        data: JSON.stringify(admin),
        contentType:"application/json",
        success: function(result) {
            if(result && result._error) {
                callback(new Error(result._error), undefined)
            } else {
                callback(undefined, result)
            }
        },
        error: function(err) {
            callback(err, undefined)
        }
    })
}

Facade.login = function(name, pass, callback) {
    var admin = {
        username: name,
        password: pass
    }
    $.ajax({
        url: "/admins/login",
        type: "POST",
        data: JSON.stringify(admin),
        contentType:"application/json",
        success: function(result) {
            if(result && result._error) {
                callback(new Error(result._error), undefined)
            } else {
                callback(undefined, result)
            }
        },
        error: function(err) {
            callback(err, undefined)
        }
    })
}