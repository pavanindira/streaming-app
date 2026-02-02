const { User } = require('../models');
const userController = require('../controllers/user.controller');
const bcrypt = require('bcrypt');

jest.mock('../models'); // Mock the User model
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedpassword123'),
}));

describe('User Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create a new user', async () => {
    const req = {
      body: {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.create.mockResolvedValue({
      username: 'testuser',
      email: 'test@example.com',
      password_hash: 'hashedpassword123',
    });

    await userController.create(req, res);

    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(User.create).toHaveBeenCalledWith({
      username: 'testuser',
      email: 'test@example.com',
      password_hash: 'hashedpassword123',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      username: 'testuser',
      email: 'test@example.com',
      password_hash: 'hashedpassword123',
    });
  });

  test('should handle errors when creating a user', async () => {
    const req = { body: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.create.mockRejectedValue(new Error('Database error'));

    await userController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
  });
});