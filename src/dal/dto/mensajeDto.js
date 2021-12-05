exports.mensajeDto = (obj) => {
    const { _id, _name, ...data} = obj;
    return {
        ...data,
        id: _id,
    }
};