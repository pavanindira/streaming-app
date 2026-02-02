const request = require('supertest');
const app = require('../app'); // Your Express app

describe('User Routes', () => {
  test('POST /users should create a new user', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('username', 'testuser');
    expect(response.body).toHaveProperty('email', 'test@example.com');
  });

  test('GET /users/:id should return a user', async () => {
    const response = await request(app).get('/users/1');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 1);
  });
});