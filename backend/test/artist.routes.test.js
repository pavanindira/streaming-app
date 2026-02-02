const request = require('supertest');
const app = require('../app'); // Your Express app
const { Artist } = require('../models'); // Sequelize models
const { expect } = require('chai');

describe('Artist Routes', () => {
  before(async () => {
    // Set up test data
    await Artist.sync({ force: true }); // Reset the Artists table
    await Artist.create({
      name: 'John Doe',
      email: 'artist@example.com',
      password_hash: 'hashed_password',
    });
  });

  it('should fetch an artist by ID', async () => {
    const res = await request(app).get('/api/artists/1');
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('name', 'John Doe');
    expect(res.body).to.have.property('email', 'artist@example.com');
  });

  it('should return 404 for a non-existent artist', async () => {
    const res = await request(app).get('/api/artists/999');
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('message', 'Artist not found');
  });

  it('should create a new artist', async () => {
    const res = await request(app)
      .post('/api/artists/register')
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
      });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('message', 'Artist registered successfully');
  });
});