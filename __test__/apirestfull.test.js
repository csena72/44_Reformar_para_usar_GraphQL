const request = require('supertest')('http://localhost:8080')
const expect = require('chai').expect
const generador = require('../src/generador/productos')

let producto = generador.get()
//console.log(producto)

describe('test api rest full', () => {
    describe('GET', () => {
        it('debería retornar un status 200', async () => {
            let response = await request.get('/api/productos')
            //console.log(response.status)
            //console.log(response.body)
            expect(response.status).to.eql(200)
        })
    })
    describe('POST', () => {
        it('debería incorporar un producto', async () => {

            let producto = generador.get()

            let response = await request.post('/api/productos').send(producto)

            expect(response.status).to.eql(200)

            const product = response.body
            expect(product).to.include.keys('title','price', 'thumbnail')

            expect(product.title).to.eql(producto.title)
            expect(product.price).to.eql(producto.price)
            expect(product.thumbnail).to.eql(producto.thumbnail)
        })
    })
})
