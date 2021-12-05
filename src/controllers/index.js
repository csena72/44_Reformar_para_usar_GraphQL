const services = require('../services');
const productoController = require('./productoController');
const mensajeController = require('./mensajeController');

module.exports = {
    productoController: productoController(services),
    mensajeController:  mensajeController(services),
}