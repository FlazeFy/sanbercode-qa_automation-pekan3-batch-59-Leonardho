import supertest from 'supertest'
import { expect } from 'chai'
import { faker } from '@faker-js/faker'
const request = supertest('https://kasir-api.zelz.my.id')

describe('Product Module', () => {
    global.testData.product = {};

    it('Should create a new product', async () => {
        const payload = {
            category_id : global.testData.categories,
            code: faker.string.nanoid(9).toUpperCase(),
            name: faker.commerce.product(),
            price: faker.number.int({min:1000,max:10000}).toString(),
            cost: faker.number.int({min:1000,max:10000}).toString(),
            stock: faker.number.int({min:1,max:99}).toString()
        };
        console.log(payload)
        const accessToken = global.testData.authentication
        const startTime = Date.now()

        const response = await request.post('/products')
            .send(payload)
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect('Content-Type', /json/)

        const responseTime = Date.now() - startTime

        // Test: Status code must be equal to 201
        expect(response.status).to.equal(201, 'Status code must be equal to 201')

        // Test: Response time is less than 5000ms
        expect(responseTime).to.be.below(5000, 'Response time must be below 5000ms')

        // Test: Response must be valid and have a body
        expect(response.body).to.exist
        expect(response.body).to.be.an('object')

        // Test: Response body must have valid format with status, message, and data
        expect(response.body).to.have.all.keys('status', 'message', 'data')
        expect(response.body.status).to.equal('success', 'Status must be "success"')
        expect(response.body.status).to.be.a('string', 'Status must be a string')
        expect(response.body.message).to.be.a('string', 'Message must be a string')
        expect(response.body.data).to.be.an('object', 'Data must be an object')

        // Test: Response product data is exist and have valid format
        const jsonData = response.body.data 
        expect(jsonData).to.have.all.keys('productId','name')
        expect(jsonData.productId).to.be.a('string')
        expect(jsonData.name).to.be.a('string')

        // Test: Product item have valid UUID format
        expect(jsonData.productId).that.has.lengthOf(36)
        expect((jsonData.productId.match(/-/g) || []).length).to.equal(4)
        
        global.testData.product = jsonData.productId
    });

    it('Should get all product', async () => {
        const accessToken = global.testData.authentication
        const startTime = Date.now()

        const response = await request.get('/products')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect('Content-Type', /json/)

        const responseTime = Date.now() - startTime

        // Test: Status code must be equal to 200
        expect(response.status).to.equal(200, 'Status code must be equal to 200')

        // Test: Response time is less than 5000ms
        expect(responseTime).to.be.below(5000, 'Response time must be below 5000ms')

        // Test: Response must be valid and have a body
        expect(response.body).to.exist
        expect(response.body).to.be.an('object')

        // Test: Response body have valid format who have status and data
        const jsonData = response.body
    
        expect(jsonData).to.have.all.keys('status','data')
        expect(jsonData.status).to.eql("success")
        expect(jsonData.status).to.be.a('string')
        expect(jsonData.data).to.be.an('object')
        expect(jsonData.data.products).to.be.an('array')
        expect(jsonData.data.meta).to.be.an('object')
        
        // Test: Response body have meta the props of get api
        const jsonMeta = response.body.data.meta
    
        expect(jsonMeta).to.have.all.keys('totalPage','total','page')
        expect(jsonMeta.totalPage).to.be.a('number')
        expect(jsonMeta.total).to.be.a('number')
        expect(jsonMeta.page).to.be.a('number')
        expect(jsonMeta.totalPage).to.be.at.least(0)
        expect(jsonMeta.total).to.be.at.least(0)
        expect(jsonMeta.page).to.be.at.least(0)
        
        // Test: Products item have valid key and value
        const jsonProd = response.body.data.products
    
        for(let i = 0; i < jsonProd.length; i++){
            expect(jsonProd[i].id).to.be.a('string')
            expect(jsonProd[i].code).to.be.a('string')
            expect(jsonProd[i].description).to.satisfy(function(val) {
                return typeof val == 'string' || val == null;
            });
            expect(jsonProd[i].price).to.be.a('number')
            expect(jsonProd[i].cost).to.be.a('number')
            expect(jsonProd[i].stock).to.be.a('number')
            expect(jsonProd[i].sale).to.be.a('number')
            expect(jsonProd[i].purchase).to.be.a('number')
            expect(jsonProd[i].category_name).to.be.a('string')
        }
        
        // Test: Products item have valid UUID format    
        for(let i = 0; i < jsonProd.length; i++){
            expect(jsonProd[i].id).that.has.lengthOf(36)
            expect((jsonProd[i].id.match(/-/g) || []).length).to.equal(4)
        }
    });

    it('Should update a product', async () => {
        const payload = {
            category_id : global.testData.categories,
            code: faker.string.nanoid(9).toUpperCase(),
            name: faker.commerce.product(),
            price: faker.number.int({min:1000,max:10000}).toString(),
            cost: faker.number.int({min:1000,max:10000}).toString(),
            stock: faker.number.int({min:1,max:99}).toString()
        };
        console.log(payload)
        const accessToken = global.testData.authentication
        const productId = global.testData.product
        const startTime = Date.now()

        const response = await request.put(`/products/${productId}`)
            .send(payload)
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect('Content-Type', /json/)

        const responseTime = Date.now() - startTime

        // Test: Status code must be equal to 200
        expect(response.status).to.equal(200, 'Status code must be equal to 200')

        // Test: Response time is less than 5000ms
        expect(responseTime).to.be.below(5000, 'Response time must be below 5000ms')

        // Test: Response must be valid and have a body
        expect(response.body).to.exist
        expect(response.body).to.be.an('object')

        // Test: Response body must have valid format with status, message, and data
        expect(response.body).to.have.all.keys('status', 'message', 'data')
        expect(response.body.status).to.equal('success', 'Status must be "success"')
        expect(response.body.status).to.be.a('string', 'Status must be a string')
        expect(response.body.message).to.be.a('string', 'Message must be a string')
        expect(response.body.data).to.be.an('object', 'Data must be an object')

        // Test:Response data is exist and have product name
        const jsonData = response.body.data 
        expect(jsonData.name).to.be.a('string')
    });

    it('Should delete a product', async () => {
        const accessToken = global.testData.authentication
        const productId = global.testData.product
        const startTime = Date.now()

        const response = await request.delete(`/products/${productId}`)
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${accessToken}`)

        const responseTime = Date.now() - startTime

        // Test: Status code must be equal to 200
        expect(response.status).to.equal(200, 'Status code must be equal to 200')

        // Test: Response time is less than 5000ms
        expect(responseTime).to.be.below(5000, 'Response time must be below 5000ms')

        // Test: Response must be valid and have a body
        expect(response.body).to.exist
        expect(response.body).to.be.an('object')

        // Test: Response body must have valid format with status and message
        expect(response.body).to.have.all.keys('status', 'message')
        expect(response.body.status).to.equal('success', 'Status must be "success"')
        expect(response.body.status).to.be.a('string', 'Status must be a string')
        expect(response.body.message).to.be.a('string', 'Message must be a string')
    });
});
