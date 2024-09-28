import supertest from 'supertest'
import { expect } from 'chai'
import { faker } from '@faker-js/faker'
const request = supertest('https://kasir-api.zelz.my.id')
import { describe, it } from 'mocha'

describe('Categories Module', () => {
    global.testData.categories = {};

    it('Should create a new category', async () => {
        const payload = {
            name: faker.commerce.product(), 
            description: faker.lorem.lines() 
        };
        console.log(payload)
        const accessToken = global.testData.authentication
        const startTime = Date.now()

        const response = await request.post('/categories')
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

        // Test: Response category data is exist and have valid format
        const jsonData = response.body.data 
        expect(jsonData).to.have.all.keys('categoryId','name')
        expect(jsonData.categoryId).to.be.a('string', 'categoryId must be a string')
        expect(jsonData.name).to.be.a('string', 'name must be a string')

        // Test: Category item have valid UUID format
        expect(jsonData.categoryId).that.has.lengthOf(36)
        expect((jsonData.categoryId.match(/-/g) || []).length).to.equal(4)
        
        global.testData.categories = jsonData.categoryId
    });

    it('Should get all categories', async () => {
        const accessToken = global.testData.authentication
        const startTime = Date.now()

        const response = await request.get('/categories')
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

        // Test: Response body must have valid format with status and data
        expect(response.body).to.have.all.keys('status', 'data')
        expect(response.body.status).to.equal('success', 'Status must be "success"')
        expect(response.body.status).to.be.a('string', 'Status must be a string')
        expect(response.body.data).to.be.an('object', 'Data must be an object')
        expect(response.body.data.categories).to.be.an('array', 'Categories must be an array')
        expect(response.body.data.meta).to.be.an('object', 'Meta must be an object')

        // Test: Response body have meta the props of get api
        const jsonData = response.body.data.meta

        expect(jsonData).to.have.all.keys('totalPage','total','page')
        expect(jsonData.totalPage).to.be.a('number', 'totalPage must be a number')
        expect(jsonData.total).to.be.a('number', 'total must be a number')
        expect(jsonData.page).to.be.a('number', 'page must be a number')
        expect(jsonData.totalPage).to.be.at.least(0)
        expect(jsonData.total).to.be.at.least(0)
        expect(jsonData.page).to.be.at.least(0)

        // Test: Categories item have valid key and value
        const jsonCat = response.body.data.categories
        for(let i = 0; i < jsonCat.length; i++){
            expect(jsonCat[i].id).to.be.a('string')
            expect(jsonCat[i].name).to.be.a('string')
            expect(jsonCat[i].description).to.satisfy(function(val) {
                return typeof val == 'string' || val == null
            });
        }

        // Test: Categories item have valid UUID format
        for(let i = 0; i < jsonCat.length; i++){
            expect(jsonCat[i].id).that.has.lengthOf(36)
            expect((jsonCat[i].id.match(/-/g) || []).length).to.equal(4)
        }
    });
});
