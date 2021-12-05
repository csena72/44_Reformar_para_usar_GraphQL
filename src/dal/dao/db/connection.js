const mongoose = require("mongoose");
const { MONGO_URI } = require("../../../config/globals");
const logger = require('../../../logs/logger');

const loggerInfo = logger.getLogger('info');
const loggerWarn = logger.getLogger('warn');
const loggerError = logger.getLogger('error');

exports.getConnection = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    loggerInfo.info('base MongoDB conectada')
    return "Connection Success!";
  } catch (error) {
    loggerInfo.info(`Error en conexión de Base de datos: ${error}`)
    loggerError.error(`Error en conexión de Base de datos: ${error}`)
    return `Connection Failed! - ${error}`;
  }
};