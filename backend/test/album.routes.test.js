const request = require('supertest');
const app = require('../app');
const { Album, Artist } = require('../models');
const { expect } = require('chai');

describe('Album Routes', () => {
  before(async () => {
    // Set up test data
    await Artist.sync({ force: true });
    await Album.sync({ force: true });

    const artist = await Artist.create({
      name: 'John Doe',
      email: 'artist@example.com',
      password_hash: 'hashed_password',
    });

    await Album.create({
      title: 'My First Album',
      artist_id: artist.id,
      release_date: '2025-04-25',
      cover_image_url: 'https://example.com/album-cover.jpg',
    });
  });

  it('should fetch all albums', async () => {
    const res = await request(app).get('/api/albums');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
    expect(res.body[0]).to.have.property('title', 'My First Album');
  });

  it('should fetch an album by ID', async () => {
    const res = await request(app).get('/api/albums/1');
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('title', 'My First Album');
  });

  it('should return 404 for a non-existent album', async () => {
    const res = await request(app).get('/api/albums/999');
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('message', 'Album not found');
  });
});