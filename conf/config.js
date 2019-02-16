module.exports = {
    // Server port (number between 1 and 65535)
    port: 3000,
    // Server IP or domain (or 'localhost')
    domain: 'localhost',
    // Logging level (1, 2, 3, or 4)
    logLevel: 4,
    // [OPTIONAL] Mongo host. Default is 'localhost'.
    mongoHost: 'localhost',
    // [OPTIONAL] Mongo port. Default is '27017'.
    mongoPort: '27017',
    // [REQUIRED] Mongo user.
    mongoUser: 'user',
    // [REQUIRED] Mongo password.
    mongoPass: 'password',
    // [REQUIRED] Mongo database.
    mongoDatabase: 'digital_twins'
}