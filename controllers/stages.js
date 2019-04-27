// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Node modules
const async = require('async')

// ====================================================================================================================
// Module exports
// ====================================================================================================================

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
    io.emit(`${username}/${stageid}`, { "action": dataid })
    console.log({dataid, stageid, username, len, type, data})
}