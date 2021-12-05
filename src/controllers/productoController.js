const { productoDto } = require('../dal/dto/productoDto');

const productoController = (service) => {
    const { productoService } = service;

    return {
        createProducto: async (req, res) => {
            await productoService.createProducto(req.body);
            res.json('Producto creado!');
        },

        findAllProductos: async (req, res,next) => {
            const allProductos = await productoService.getAllProductos();
            resProducts = allProductos.map(product => productoDto(product));
            res.json(resProducts);
        },

        updateProducto: async (req, res,next) => {
            const { body, params: { id } } = req;
            const updateProducto = await productoService.updateProducto(id, body);
            res.json(updateProducto);
        },

        getOneProducto: async (req, res,next) => {
            const {
                body,
                params: { id }
            } = req;
            const productoRetriever = await productoService.getProducto(id);
            res.json(productoRetriever);
        },

        deleteProducto: async (req, res,next) => {
            const {
                body,
                params: { id }
            } = req;
            await productoService.deleteProducto(id);
            res.json({msg: 'Ok'});
        }

    }
}

module.exports = productoController;