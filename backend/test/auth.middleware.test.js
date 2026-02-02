const request = require('supertest');
const app = require('../app');
const { expect } = require('chai');

describe('Authentication Middleware', () => {
  it('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/api/albums');
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('message', 'Access denied. No token provided.');
  });

  it('should return 401 if the token is invalid', async () => {
    const res = await request(app)
      .get('/api/albums')
      .set('Authorization', 'Bearer invalid_token');
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('message', 'Invalid token');
  });
});