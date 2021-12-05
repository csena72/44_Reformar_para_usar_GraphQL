const moment = require("moment");
const { normalizeMessages, print } = require("../utils/normalizer");

const mensajeService = (mensajeModel) => ({

    async createMensaje(mensaje) {
        mensaje.date = `[${moment().format("DD/MM/YYYY hh:mm:ss")}]`;
        mensaje.id = Date.now();
        const messageCreated = await mensajeModel.create(mensaje);
        return messageCreated;
    },

    async getAllMensajes() {
        const mensajes = await mensajeModel.find().lean();
        const messageCenter = messageCenterBuilder(mensajes);
        const normalizedMsgs = normalizeMessages(messageCenter);
        return normalizedMsgs;
    },

});

const messageCenterBuilder = (messages) => {
    return { id: 1, content: messages };
}

module.exports = mensajeService;