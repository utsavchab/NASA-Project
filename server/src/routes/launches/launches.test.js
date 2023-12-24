const request = require('supertest')
const app = require('../../app')
const { connectToDB, disconnectToDB } = require('../../config/database.config')
const { loadPlanetsData } = require('../../models/planets.model')
require('dotenv').config()
beforeAll(async () => {
  await connectToDB(process.env.TEST_MONGO_URI)
  await loadPlanetsData()
})

afterAll(async () => {
  await disconnectToDB()
})
describe('Test GET /api/v1/launches', () => {
  test('It should respond with 200 success', async () => {
    const response = await request(app)
      .get('/api/v1/launches')
      .expect(200)
      .expect('Content-Type', /json/)

    expect(response.body.success).toBe(true)
    expect(Array.isArray(response.body.data)).toBe(true)
  })
})

const completeLaunchData = {
  mission: 'USS Enterprise',
  rocket: 'NCC 1701-D',
  target: 'Kepler-442 b',
  launchDate: 'January 4, 2028',
}
const launchDataWithWrongTarget = {
  mission: 'USS Enterprise',
  rocket: 'NCC 1701-D',
  target: 'Kepler',
  launchDate: 'January 4, 2028',
}
const launchDataWithoutMission = {
  rocket: 'NCC 1701-D',
  target: 'Kepler-442 b',
  launchDate: 'January 4, 2028',
}
const launchDataWithInvalidMission = {
  mission: '   ',
  rocket: 'NCC 1701-D',
  target: 'Kepler-442 b',
  launchDate: 'January 4, 2028',
}
const launchDataWithoutRocket = {
  mission: 'USS Enterprise',
  target: 'Kepler-442 b',
  launchDate: 'January 4, 2028',
}
const launchDataWithInvalidRocket = {
  mission: 'USS Enterprise',
  rocket: '      ',
  target: 'Kepler-442 b',
  launchDate: 'January 4, 2028',
}
const launchDataWithInvalidDate = {
  mission: 'USS Enterprise',
  rocket: 'NCC 1701-D',
  target: 'Kepler-442 b',
  launchDate: ' 4, 2028',
}
describe('Test POST /api/v1/launches', () => {
  test('It should respond with 201 created', async () => {
    const response = await request(app)
      .post('/api/v1/launches')
      .send(completeLaunchData)
      .expect(201)
  })
  test('It should catch wrong target with message "No Matching Target Planet Found."', async () => {
    const response = await request(app)
      .post('/api/v1/launches')
      .send(launchDataWithWrongTarget)
      .expect(400)
      .expect('Content-Type', /json/)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe('No Matching Target Planet Found.')
  })
  test('It should catch input fields missing with message "All Fields are required."', async () => {
    const response = await request(app)
      .post('/api/v1/launches')
      .send(launchDataWithoutMission)
      .expect(400)
      .expect('Content-Type', /json/)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe('All Fields are required.')
    const response2 = await request(app)
      .post('/api/v1/launches')
      .send(launchDataWithInvalidMission)
      .expect(400)
      .expect('Content-Type', /json/)
    expect(response2.body.success).toBe(false)
    expect(response2.body.message).toBe('All Fields are required.')
    const response3 = await request(app)
      .post('/api/v1/launches')
      .send(launchDataWithoutRocket)
      .expect(400)
      .expect('Content-Type', /json/)
    expect(response3.body.success).toBe(false)
    expect(response3.body.message).toBe('All Fields are required.')
    const response4 = await request(app)
      .post('/api/v1/launches')
      .send(launchDataWithInvalidRocket)
      .expect(400)
      .expect('Content-Type', /json/)
    expect(response4.body.success).toBe(false)
    expect(response4.body.message).toBe('All Fields are required.')
  })
  test('It should catch invalid dates with message "Invalid Launch Date.', async () => {
    const response4 = await request(app)
      .post('/api/v1/launches')
      .send(launchDataWithInvalidDate)
      .expect(400)
      .expect('Content-Type', /json/)
    expect(response4.body.success).toBe(false)
    expect(response4.body.message).toBe('Invalid Launch Date.')
  })
})

describe('Test DELETE /api/v1/launches', () => {
  const wrongID = 'abc'

  test(`It should respond with status 200 with message \"Flight Number {id}, is aborted.\"`, async () => {
    const postResponse = await request(app)
      .post(`/api/v1/launches`)
      .send(completeLaunchData)
      .expect(201)
    const id = postResponse.body.data.flightNumber
    const response = await request(app)
      .delete(`/api/v1/launches/${id}`)
      .expect(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data).toBe(id)
    expect(response.body.message).toBe(`Flight Number ${id}, is aborted.`)
  })

  test(`It should respond with status 404 with message "ID:1 is invalid"`, async () => {
    const response = await request(app).delete(`/api/v1/launches/1`).expect(404)
    expect(response.body.success).toBe(false)

    expect(response.body.message).toBe(`ID:1 is invalid`)
  })

  test(`It should respond with status 404 with message  "ID:${wrongID} is invalid" `, async () => {
    const response = await request(app)
      .delete(`/api/v1/launches/${wrongID}`)
      .expect(404)
    expect(response.body.success).toBe(false)

    expect(response.body.message).toBe(`ID:${wrongID} is invalid`)
  })
})
