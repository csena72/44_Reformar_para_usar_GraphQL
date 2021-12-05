const productoDao = require('../dal/dao/models/productoDao');
const mensajeDao = require('../dal/dao/models/mensajeDao');
const productoService = require('./productoService');
const mensajeService = require('./mensajeService');

module.exports = {
    productoService: productoService(productoDao),
    mensajeService: mensajeService(mensajeDao),
}