// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Node modules
const async = require('async')

// ====================================================================================================================
// Module exports
// ====================================================================================================================

const HEADER_SIZE_MSG_MQTT = 2
const MAX_SIZE_MSG_MQTT = 256

module.exports.create = function(req, res, next) {
    let {actions, id_str, model, name} = req.body
    let owenerId = req.session.user.id

    async.series([
        // Get the model data
        function getModel(cb) {
            mongodb.read('models', {owenerId, "name": model.name}, function(error, docs) {
                if (error)
                    return cb(error)

                let newData = { "ext": docs[0].ext, "path": docs[0].path }
                model = fns.concatObjects(model, newData)
                cb()
            })
        },
        // Save the stage data
        function saveStage(cb) {
            let article = {
                name,
                id_str,
                "owener_id": owenerId,
                model,
                actions
            }
            mongodb.create('stages', article, function(error, result) {
                if (error)
                    return cb(error)

                log.info(`Inserted stage with ID: ${result.insertedId}`)
                cb()
            })
        }
    ], function(error) {
        if (error) {
            req.error = error
            log.error(req.error)
            return res.renderError(500)
        }
        next()
    })
}

module.exports.idStrExist = function(req, res, next) {
    let idStr = req.params.idStr

    mongodb.read('stages', { "id_str": idStr }, function(error, docs) {
        if (error) {
            req.error = error
            return res.renderError(500)
        }

        // If the idStr exists or it is a reserved word
        if ((docs && docs.length) || fns.arrayContains(config.reservedWords, idStr)) {
            req.error = fns.formatError(errors.EXISTING_STAGE_ID_STR, idStr)
            log.error(req.error.message)
            return next()
        } else {
            log.debug('Id str free')
        }
        return next()
    })
}

module.exports.getStages = function(req, res, next) {
    let {id_str} = req.params
    let owenerId = req.session.user.id
    let where = id_str ? {id_str, "owener_id": owenerId} : {"owener_id": owenerId}  // If there isn't a id_str, it get all models

    mongodb.read('stages', where, function(error, docs) {
        if (error) {
            req.error = error
            return res.renderError(500)
        }
        if (docs && docs.length !== 0)
            req.stage = docs[0]  // Show the stage in its page
        else if (id_str && (!docs || docs.length === 0))
            return res.renderError(404)
        req.data = docs  // Get all the stages in the index page
        next()
    }, { "project": { "model.path": 0 } })
}

module.exports.new = function(req, res, next) {
    let owenerId = req.session.user.id

    mongodb.read('models', {owenerId}, function(error, docs) {
        if (error) {
            req.error = error
            log.error(req.error)
            return next()
        }
        req.userModels = docs
        next()
    }, { "sort": { "name": 1 } })
}

// Read the data sent by MQTT
module.exports.readData = function(topic, payload, message) {
    let {dataid, stageid, username} = message.params
    let {data, len, type} = fns.readMQTT(payload, topic)

    console.log(`MQTT ${topic}`)

    switch(type) {
        case 0:
            sendAction(dataid, data, len, stageid, username)
            break
        default:
            break
    }
}

// ====================================================================================================================
// Private functions
// ====================================================================================================================

const saveData = function(stageId, dataName, type, value) {
    async.waterfall([
        // Get the data of the stage
        function getData(cb) {
            mongodb.read('stages', { "id_str": stageId }, function(error, docs) {
                if (error || !docs[0])
                    return
                let data, dataAux
                if (docs[0].data) {
                    data = docs[0].data
                    if (data[dataName]) {
                        let values = data[dataName].values
                        if (value.value !== values[0].value)  // If different value, the new value is in the first position
                            values = [value, ...values]
                        else if (value.value === 'START')  // If same value and it is "START", it replaces the value
                            values[0] = value
                        // If same value and it's not "START", it doesn't change
                        data[dataName].values = values
                        // Set the data in the last position
                        dataAux = data[dataName]
                        delete data[dataName]
                        data[dataName] = dataAux
                    } else {
                        data[dataName] = {
                            "type": type,
                            "values": [value]
                        }
                    }
                } else {
                    data = {}
                    data[dataName] = {
                        "type": type,
                        "values": [value]
                    }
                }
                cb(null, data)
            }, { "project": { "data": 1, "_id": 0 } })
        },
        // Update the stage with the new data
        function updateStage(data, cb) {
            mongodb.update('stages', { "id_str": stageId }, {data}, function(error, result) {
                if (error)
                    return
            })
        }
    ])
}

const sendAction = function(actionName, data, len, stageId, username) {
    len = Math.min(len, MAX_SIZE_MSG_MQTT - HEADER_SIZE_MSG_MQTT)
    data = +data.substring(0, len)

    let status = '', value = {}

    switch(data) {
        case 0:
            status = 'START'
            value = {
                "value": "START",
                "timestamp": new Date()
            }
            break
        case 1:
            status = 'PAUSE'
            value = {
                "value": "PAUSE",
                "timestamp": new Date()
            }
            break
        case 2:
            status = 'RESUME'
            value = {
                "value": "RESUME",
                "timestamp": new Date()
            }
            break
        case 3:
            status = 'STOP'
            value = {
                "value": "STOP",
                "timestamp": new Date()
            }
            break
        default:
            break
    }

    saveData(stageId, actionName, 0, value)
    if (typeof io !== 'undefined')
        io.emit(`${username}/${stageId}`, { "action": { "name": actionName, status } })
}