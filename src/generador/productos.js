const faker = require('faker')

//faker.locale = 'es'

const get = () => ({
    title: faker.commerce.productName(),
    price: faker.commerce.price(),
    thumbnail: faker.internet.url()
})

module.exports = {
    get
}