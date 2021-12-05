
const productoService = (productoModel) => ({

    async createProducto(producto){
        await productoModel.create(producto);
    },

    async getProducto(id){
        return productoModel.findById(id);
    },

    async getAllProductos(){
        return productoModel.find().lean();
    },

    async updateProducto(id, productoUpdate){
        const productoToUpdate = await productoModel.findByIdAndUpdate(id, productoUpdate, {
            new: true,
        });
        return productoToUpdate;
    },

    async deleteProducto(id){
        await productoModel.findByIdAndDelete(id);
    },

});

module.exports = productoService;