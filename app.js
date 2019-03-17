// ====================================================================================================================
// Dependencies
// ====================================================================================================================

// Node modules
const cookieParser = require('cookie-parser')
const express = require('express')
const fileUpload = require('express-fileupload')
const http = require('http')
const methodOverride = require('method-override')
const morgan = require('morgan')
const parser = require('body-parser')
const partials = require('express-partials')
const path = require('path')
const session = require('express-session')

// Own modules
const modules = require('./modules')
const router = require('./router')

// ====================================================================================================================
// Functions
// ====================================================================================================================

// Event listener for HTTP server "error" event
const onError = function(error) {
    if (error.syscall !== 'listen') {
        throw error
    }

    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port

    // Handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges')
            process.exit(1)
            break
        case 'EADDRINUSE':
            console.error(bind + ' is already in use')
            process.exit(1)
            break
        default:
            throw error
    }
}

// Event listener for HTTP server "listening" event
const onListening = function() {
    let addr = server.address()
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port
    console.log('Listening on ' + bind)
}

// Returns the response code escaped by a ANSII color:
const responseColor = function(req, res) {
    let status = res.statusCode
    let color

    switch(Math.floor(status/100)) {
        case 5:  color=31; break; /* 5XX: Red    */
        case 4:  color=33; break; /* 4XX: Yellow */
        case 3:  color=36; break; /* 3XX: Cyan   */
        default: color=32;        /* 2XX: Green  */
    }

    return '\x1b[' + color + 'm' + status + '\x1b[0m'
}

// ====================================================================================================================
// Create app
// ====================================================================================================================

// Create express app
let app = express()

// Load modules
modules.load(process.argv)

// Print logo and intro message, defined in configuration
console.log(config.logo)
console.log(config.introMsg)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// Custom route to components
app.use('/components', express.static(path.join(__dirname, 'node_modules')))

// Use morgan
morgan.token('status', responseColor)
app.use(morgan('tiny'))

// Use methods PUT and DELETE
app.use(methodOverride('_method', { methods: ['POST', 'GET'] }))

// Parse application/json and application/x-www-form-urlencoded
app.use(parser.json())
app.use(parser.urlencoded({ extended: false }))

// Parse cookies
app.use(cookieParser())

// Partials
app.use(partials())

// Session
app.use(session({ "secret": "digital_twins", "resave": false, saveUninitialized: true }))
app.use(function(req, res, next) {
    res.locals.session = req.session
    next()
})

// Declare public files URL
app.use(express.static(path.join(__dirname, 'public')))

// Upload files
app.use(fileUpload())

// Initialize router
router.mount(app)

// Set app port
app.set('port', config.port)

// ====================================================================================================================
// Create server
// ====================================================================================================================

// Create HTTP server
let server = http.createServer(app)

// Listen on provided port, on all network interfaces
server.listen(config.port)
server.on('error', onError)
server.on('listening', onListening)
