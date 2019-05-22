// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Node modules
const async = require('async')
const path = require('path')

// ====================================================================================================================
// Module exports
// ====================================================================================================================

const HEADER_SIZE_MSG_MQTT = 2
const MAX_SIZE_MSG_MQTT = 256

module.exports.create = function(req, res, next) {
    let background = req.files['background-file']
    let {actions, events, id_str, model, name} = JSON.parse(req.body.data)
    let filePathBackgrounds = path.join(__dirname, '../files/backgrounds')
    let ownerId = req.session.user.id

    async.series([
        // Get the model data
        function getModel(cb) {
            mongodb.read('models', {"owner_id": ownerId, "name": model.name}, function(error, docs) {
                if (error)
                    return cb(error)

                let newData = { "ext": docs[0].ext, "path": docs[0].path }
                model = fns.concatObjects(model, newData)
                cb()
            })
        },
        // Save the background
        function saveBackground(cb) {
            if (!background) {
                cb()
            } else if (!background.length) {
                let backgroundStage, fileExt = background.name.split('.').pop()
                filePath = `${filePathBackgrounds}/${ownerId}_${id_str}.${fileExt}`
                backgroundStage = {
                    "type": "texture",
                    "path": filePath
                }
                background.mv(filePath, function(error) {
                    if (error) {
                        req.error = error
                        return res.renderError(500)
                    } else {
                        model['background'] = backgroundStage
                        log.debug(`File ${filePath} saved`)
                        cb()
                    }
                })
            } else if (background.length > 0) {
                let backgroundStage = {
                    "type": "cube",
                    "path": []
                }
                background.forEach(function(file) {
                    let fileExt = file.name.split('.').pop()
                    let fileName = file.name.split('.')[0]
                    let orderNames = ['posx', 'negx', 'posy', 'negy', 'posz', 'negz']
                    filePath = `${filePathBackgrounds}/${ownerId}_${id_str}_${fileName}.${fileExt}`
                    file.mv(filePath, function(error, a, b,c,d) {
                        if (error) {
                            req.error = error
                            return res.renderError(500)
                        } else {
                            let fileItemName = `${filePathBackgrounds}/${ownerId}_${id_str}_${fileName}.${fileExt}`
                            backgroundStage.path[orderNames.indexOf(fileName)] = fileItemName
                            log.debug(`File ${fileItemName} saved`)
                        }
                    })
                })
                model['background'] = backgroundStage
                cb()
            }
        },
        // Save the stage data
        function saveStage(cb) {
            let article = {
                name,
                id_str,
                "owner_id": ownerId,
                model,
                actions,
                events
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

module.exports.getBackground = function(req, res, next) {
    let {idStr, pos, type} = req.params
    let ownerId = req.session.user.id

    let orderNames = ['posx', 'negx', 'posy', 'negy', 'posz', 'negz']

    mongodb.read('stages', { "id_str": idStr, "owner_id": ownerId }, function(error, docs) {
        //If error in query
        if (error) {
            req.error = error
            log.error(req.error)
            return next()
        }
        // If no results found
        if (!docs || !docs.length) {
            req.error = errors.RESOURCE_NOT_FOUND
            log.error(req.error.message)
            return next()
        }
        if (type === 'texture')
            req.file = docs[0].model.background.path
        else if (type === 'cube')
            req.file = docs[0].model.background.path[orderNames.indexOf(pos)]
        return next()
    }, { "project": { "model.background": 1 } })
}

module.exports.getStages = function(req, res, next) {
    let {id_str} = req.params
    let ownerId = req.session.user.id
    let where = id_str ? {id_str, "owner_id": ownerId} : {"owner_id": ownerId}  // If there isn't a id_str, it get all models

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
    }, { "project": { "model.path": 0, "model.background.path": 0 } })
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

module.exports.new = function(req, res, next) {
    let ownerId = req.session.user.id

    mongodb.read('models', { "owner_id": ownerId }, function(error, docs) {
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
    let {data, len, type} = fns.readMQTT(payload)

    console.log(`MQTT ${topic}`)

    switch(type) {
        case 0:
            sendAction(dataid, data, len, stageid, username)
            break
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
            saveData(stageid, dataid, type, {
                "value": data,
                "timestamp": new Date()
            })
            break
        default:
            return
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
                let data, dataAux, dataNames

                if (docs[0].data) {  // If there is saved data
                    data = docs[0].data

                    if (value.value === 'STOP_ALL') {
                        dataNames = data.filter((datum) => datum.type === type).map((datum) => datum.name)  // Update all data
                        value.value = 'STOP'
                    } else {
                        dataNames = [dataName]  // Update only one datum
                    }

                    dataNames.forEach(function(dataName) {
                        if (data.reduce((pre, curr) => pre |= (curr.name === dataName), false)) {  // If there is saved data with this name
                            let index = data.findIndex((datum) => datum.name === dataName)
                            let {name, type, values} = data[index]

                            if (type === 0) {
                                if (value.value !== values[0].value)  // If different value, the new value is in the first position
                                    values = [value, ...values]
                                else if (value.value === 'START')  // If same value and it is "START", it replaces the value
                                    values[0] = value
                                // If same value and it's not "START", it doesn't change
                            } else {
                                values = [value, ...values]
                            }

                            // Set the data in the last position
                            data.splice(index, 1)
                            data.push({
                                "name": dataName,
                                "type": type,
                                "values": values
                            })
                        } else {  // If there is no saved data with this name yet
                            data.push({
                                "name": dataName,
                                "type": type,
                                "values": [value]
                            })
                        }
                    })
                } else {  // If there is no saved data yet
                    data = [{
                        "name": dataName,
                        "type": type,
                        "values": [value]
                    }]
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
            break
        case 1:
            status = 'PAUSE'
            break
        case 2:
            status = 'RESUME'
            break
        case 3:
            status = 'STOP'
            break
        case 4:
            status = 'STOP_ALL'
            break
        default:
            return
    }

    value = {
        "value": status,
        "timestamp": new Date()
    }

    saveData(stageId, actionName, 0, value)
    if (typeof io !== 'undefined')
        io.emit(`${username}/${stageId}`, { "action": { "name": actionName, status } })
}