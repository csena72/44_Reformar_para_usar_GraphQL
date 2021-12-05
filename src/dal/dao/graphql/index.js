var { graphqlHTTP }  = require('express-graphql');
var { buildSchema } = require('graphql');

const axios = require('axios');

// GraphQL schema
//https://graphql.org/graphql-js/basic-types/
var schema = buildSchema(`
type Query {
  product(_id: String!): Product,
  products(title: String): [Product]
},
type Mutation {
  updateProduct(_id: String!, title: String!, price: Int!, thumbnail:  String!): Product
},

type Product {
  _id: String
  title: String
  price: Int
  thumbnail: String
}
`);

/*   const getProductsData = async () => {
let productoService = new ProductoService();
let productos = await productoService.getAllProductos();
return productos;
} */

(async () => {
  const resp = await axios.get('http://localhost:8080/api/productos');
  const productsData = resp.data;
})()

//let productsData = getProductsData();

const getProduct = function(args) {
let _id = args._id;
return productsData.filter(product => {
    return product._id == _id;
})[0];
}

const getProducts = function() {
return productsData
}

const updateProduct = function({_id, title, price, thumbnail}) {
productsData.map(product => {
    if (product._id === _id) {
        product.title = title;
        product.price = price;
        product.thumbnail = thumbnail;
        return product;
    }
});
return productsData.filter(product => product._id === _id) [0];
}

// Root resolver
let root = {
  product: getProduct,
  products: getProducts,
  updateProduct: updateProduct
};

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true
}));