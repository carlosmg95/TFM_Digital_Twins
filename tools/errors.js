// ====================================================================================================================
// Requirements
// ====================================================================================================================

// Node modules
const _ = require('underscore')

// ====================================================================================================================
// Define errors
// ====================================================================================================================

// API errors
const apiErrors = {
    // API errors
    WRONG_SYNTAX:               {code: 100, message: 'Sintáxis errónea'},
    UNKNOWN_AP:                 {code: 101, message: 'Punto de acceso desconocido'},
    RESOURCE_NOT_FOUND:         {code: 102, message: 'Elemento no encontrado'},
    WRONG_REQ_PARAMS:           {code: 103, message: 'Parámetros erróneos'},
    NO_RESULTS_FOUND:           {code: 104, message: 'Sin resultados'},
    NO_PARAMS:                  {code: 105, message: 'Faltan parámetros'},
    TOO_LARGE:                  {code: 413, message: 'El archivo supera los %p MB máximos'},
    // Validation errors
        // Users
    EXISTING_USERNAME:          {code: 600, message: 'El usuario "%p" ya existe'},
    EXISTING_EMAIL:             {code: 601, message: 'El email "%p" ya existe'},
    WRONG_USER:                 {code: 602, message: 'Usuario o contraseña incorrecta'},
    WRONG_PASSWORD:             {code: 603, message: 'Contraseña incorrecta'},
    WRONG_FORMAT_USER:          {code: 604, message: 'El formato del username ("%p") es incorrecto'},
        // Models
    EXISTING_MODEL_NAME:        {code: 700, message: 'El nombre "%p" ya existe'},
    WRONG_FORMAT_MODEL:         {code: 701, message: 'El formato del nombre ("%p") es incorrecto'},
        // Stages
    EXISTING_STAGE_ID_STR:      {code: 800, message: 'El id "%p" ya existe'}
}

// Client-side errors
const clientSideErrors = {
    401: {
        code: 401,
        status: 'Unauthorized',
        message: 'You are not authorized to perform the requested action',
        image: '/images/sad.ico'
    },
    403: {
        code: 403,
        status: 'Forbidden',
        message: 'You cannot access to this page',
        image: '/images/sad.ico'
    },
    404: {
        code: 404,
        status: 'Not Found',
        message: 'The requested URL doesn\'t exist or is no longer available',
        image: '/images/sad.ico'
    },
    413: {
        code: 413,
        status: 'Too Large',
        message: 'Request Entity Too Large',
        image: '/images/sad.ico'
    },
    500: {
        code: 500,
        status: 'Internal Server Error',
        message: 'There was an error while processing your request',
        image: '/images/sad.ico'
    }
}

// ====================================================================================================================
// Module exports
// ====================================================================================================================

module.exports = _.extend(apiErrors, clientSideErrors)