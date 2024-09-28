import supertest from 'supertest'
import { expect } from 'chai'
import { faker } from '@faker-js/faker'
const request = supertest('https://kasir-api.zelz.my.id')

describe('Authorization Module', () => {
    global.testData = {
        registration: {},
        authentication: {}
    };

    it('Should create a new account from Registration', async () => {
        const payload = {
            name: faker.person.firstName('male'),
            email: faker.internet.email(),
            password: faker.internet.password()
        };
        console.log(payload)
        global.testData.registration = payload
        const startTime = Date.now()

        const response = await request.post('/registration')
            .send(payload)
            .set('Accept', 'application/json')
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

        // Test: All response data should have the same value as the request payload (except password)
        Object.entries(payload).forEach(([key, value]) => {
            if (key !== 'password') {
                expect(response.body.data[key]).to.equal(value, `Mismatch for key: ${key} with value: ${value}`)
            }
        });

        // Test: All response data exists and have valid data types
        expect(response.body.data).to.have.all.keys('name', 'email')
        expect(response.body.data.name).to.be.a('string', 'Name must be a string')
        expect(response.body.data.email).to.be.a('string', 'Email must be a string')
    });

    it('Can login with registered account', async () => {
        const payload = {
            email: global.testData.registration.email,
            password: global.testData.registration.password
        };
        const startTime = Date.now()

        const response = await request.post('/authentications')
            .send(payload)
            .set('Accept', 'application/json')
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
        expect(response.body.data.user).to.be.an('object', 'Data must be an object')

        // Test : Response show generated token
        const jsonData = response.body.data 
        expect(jsonData).to.have.property('accessToken')
        expect(jsonData).to.have.property('refreshToken')
        expect(jsonData.accessToken).to.be.a('string', 'accessToken must be a string')
        expect(jsonData.refreshToken).to.be.a('string', 'refreshToken must be a string')

        global.testData.authentication = jsonData.accessToken
    });
});
