const request = require('supertest');
const app = require('../src/server');
const mongoose = require('mongoose');
const CaretakerAction = require('../src/models/CaretakerAction');

// NOTE: This is a scaffold. You may need to mock auth or use a test token.
describe('Caretaker Actions API', () => {
  let server;
  beforeAll((done) => {
    server = app.listen(4001, done);
  });
  afterAll(async () => {
    await mongoose.connection.close();
    server.close();
  });
  afterEach(async () => {
    await CaretakerAction.deleteMany({});
  });

  it('should create a caretaker action', async () => {
    // You may need to provide a valid caretaker/property ObjectId and auth token
    const res = await request(server)
      .post('/api/caretaker-actions')
      .set('Authorization', 'Bearer TEST_TOKEN')
      .send({
        caretaker: '507f1f77bcf86cd799439011',
        actionType: 'maintenance_update',
        description: 'Test action',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.action).toHaveProperty('description', 'Test action');
  });

  it('should fetch caretaker actions', async () => {
    await CaretakerAction.create({
      caretaker: '507f1f77bcf86cd799439011',
      actionType: 'maintenance_update',
      description: 'Test fetch',
    });
    const res = await request(server)
      .get('/api/caretaker-actions')
      .set('Authorization', 'Bearer TEST_TOKEN');
    expect(res.statusCode).toBe(200);
    expect(res.body.actions.length).toBeGreaterThan(0);
  });
});
