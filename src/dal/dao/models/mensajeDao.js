const { Schema, model } = require('mongoose');

// Estructura del documento en MongoDB a través de Mongoose
const mensajeSchema = new Schema({
    id: String,
    author: {
      name: String,
      last_name: String,
      age: Number,
      alias: String,
      avatar: String,
    },
    email: String,
    date: String,
    message: String
});

// Obj. de la clase que me da acceso a los métodos para hacer el CRUD.
module.exports = model('mensajeDao', mensajeSchema);