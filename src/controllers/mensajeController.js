const mensajeController = (service) => {
    const { mensajeService } = service;

    return {
        createMensaje: async (req, res) => {
            await mensajeService.createMensaje(req.body);
            res.json('Mensaje creado!');
        },

        findAllMensajes: async (req, res, next) => {
            const allMensajes = await mensajeService.getAllMensajes();
            res.json(allMensajes);
        }
    }
}

module.exports = mensajeController;