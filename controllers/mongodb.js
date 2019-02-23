// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Node modules
const MongoClient = require('mongodb').MongoClient
const path = require('path')

// Own modules
const fns = require('../tools/functions')
const config = require('../conf/config')

// ====================================================================================================================
// Module exports
// ====================================================================================================================

const dbName = config.mongoDatabase
const connectUrl = `mongodb://${config.mongoUser}:${config.mongoPass}@${config.mongoHost}:${config.mongoPort}/${dbName}`

// Allowed options that can be used with cursors
const allowedOptions = {
    project: function(cursor, projection) {
        return cursor.project(projection)
    },
    skip: function(cursor, n) {
        return cursor.skip(n)
    },
    limit: function(cursor, n) {
        return cursor.limit(n)
    },
    batchSize: function(cursor, size) {
        return cursor.batchSize(size)
    },
    filter: function(cursor, filter) {
        return cursor.filter(filter)
    },
    comment: function(cursor, comment) {
        return cursor.comment(comment)
    },
    addCursorFlag: function(cursor, {flag, value}) {
        return cursor.addCursorFlag(flag, value)
    },
    addQueryModifier: function(cursor, {query, value}) {
        return cursor.addQueryModifier(query, value)
    },
    max: function(cursor, n) {
        return cursor.max(n)
    },
    maxTimeMS: function(cursor, t) {
        return cursor.maxTimeMS(t)
    },
    min: function(cursor, n) {
        return cursor.min(n)
    },
    returnKey: function(cursor, key) {
        return cursor.returnKey(key)
    },
    setReadPreference: function(cursor, preference) {
        return cursor.setReadPreference(preference)
    },
    showRecordId: function(cursor, bool) {
        return cursor.showRecordId(bool)
    },
    sort: function(cursor, value) {
        return cursor.sort(value)
    },
    hint: function(cursor, hint) {
        return cursor.hint(hint)
    }
}

/***********************************************
 *
 * Save an item in a table
 * Parameters:
 *   collection: [string] Name of the collection
 *   article: [Object] Data you want to save
 *   callback: [function] Callback function
 *   options : [Object] Options to insertOne method
 *
 */
module.exports.create = function(collection, article, callback, options={}) {
    connect(function(err, client, db) {
        if (err) {
            callback(err)
            return
        }
        let date = {
            "date_created": new Date(),
            "date_updated": new Date()
        }
        let insert = fns.concatObjects(article, date)  // It adds the date to the article

        db.collection(collection).insertOne(insert, options, function(err, r) {
            client.close()  // Client closed
            callback(err, r)
        })
    })
}

/*********************************************************************
 * 
 * Read an item from a table
 * Parameters:
 *   collection: [string] Name of the collection
 *   where: [Object] Condition of the find
 *   callback: [function] Callback function
 *   options: [Object] Options like project, skip, limit, sort...
 *     { "project": { "_id": 0 }, "sort": [['date_created', 1]], "addCursorFlag": { "flag": partial, "value": true } ... }
 *
 */
module.exports.read = function(collection, where={}, callback, options) {
    connect(function(err, client, db) {
        if (err) {
            callback(err)
            return
        }

        cursor = db.collection(collection).find(where)

        for (let i in options) {
            if (fns.arrayContains(getAllowedOptions(), i)) {
                cursor = allowedOptions[i](cursor, options[i])
            }
        }
        cursor.toArray(function(err, docs) {
            client.close()  // Client closed
            callback(err, docs)
        })
    })
}

/***************************************************
 * 
 * Update some items from a table
 * Parameters:
 *   collection: [string] Name of the collection
 *   where: [Object] Condition of the find
 *   set: [Object] New values to update
 *   callback: [function] Callback function
 *   options : [Object] Options to updateMany method
 *
 */
module.exports.update = function(collection, where={}, set, callback, options={}) {
    connect(function(err, client, db) {
        if (err) {
            callback(err)
            return
        }
        set = fns.concatObjects(set, {"date_updated": new Date()})
        db.collection(collection).updateMany(where, {$set: set}, options, function(err, r) {
            client.close()  // Client closed
            callback(err, r)
        })
    })
}

/***************************************************
 * 
 * Delete some items from a table
 * Parameters:
 *   collection: [string] Name of the collection
 *   where: [Object] Condition of the find
 *   callback: [function] Callback function
 *   options : [Object] Options to updateMany method
 *
 */
module.exports.delete = function(collection, where={}, callback, options={}) {
    connect(function(err, client, db) {
        if (err) {
            callback(err)
            return
        }
        db.collection(collection).deleteMany(where, options, function(err, r) {
            client.close()  // Client closed
            callback(err, r)
        })
    })
}

/***********************************************************
 * 
 * Get the allowed options that can be used with cursors
 * Return: The allowed options that can be used with cursors
 *
 */
module.exports.getAllowedOptions = getAllowedOptions = function() {
    return Object.keys(allowedOptions)
}

// ====================================================================================================================
// Private methods
// ====================================================================================================================

const connect = function(callback) {
    const client = new MongoClient(connectUrl, { useNewUrlParser: true })
    client.connect(function(err) {
        let db = null
        if (!err) {
            log.info('Connected correctly to server')

            db = client.db(dbName)
        }

        callback(err, client, db)
    })
}
