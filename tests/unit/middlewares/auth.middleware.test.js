// tests/unit/middlewares/auth.middleware.test.js

const jwt = require('jsonwebtoken');
const authMiddleware = require('../../../src/middlewares/auth.middleware');
const { User } = require('../../../src/models');
const userFixture = require('../../fixtures/user.fixture');

jest.mock('jsonwebtoken');
jest.mock('../../../src/models');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('devrait passer au middleware suivant avec un token valide', async () => {
    const token = 'valid-token';
    const decoded = { id: userFixture.validUser.id, role: 'CLIENT' };

    req.headers.authorization = `Bearer ${token}`;
    jwt.verify.mockReturnValue(decoded);
    User.findByPk.mockResolvedValue(userFixture.validUser);

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(userFixture.validUser);
  });

  it('devrait rejeter un token manquant', async () => {
    req.headers.authorization = undefined;

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Token manquant ou invalide' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('devrait rejeter un token avec mauvais format', async () => {
    req.headers.authorization = 'InvalidFormat token';

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('devrait rejeter un token expiré', async () => {
    const token = 'expired-token';
    req.headers.authorization = `Bearer ${token}`;
    jwt.verify.mockImplementation(() => {
      throw new Error('Token expired');
    });

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Token invalide' })
    );
  });

  it('devrait rejeter un utilisateur inexistant', async () => {
    const token = 'valid-token';
    const decoded = { id: 'non-existent-id', role: 'CLIENT' };

    req.headers.authorization = `Bearer ${token}`;
    jwt.verify.mockReturnValue(decoded);
    User.findByPk.mockResolvedValue(null);

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Utilisateur introuvable' })
    );
  });

  it('devrait rejeter un compte désactivé', async () => {
    const token = 'valid-token';
    const decoded = { id: userFixture.inactiveUser.id, role: 'CLIENT' };

    req.headers.authorization = `Bearer ${token}`;
    jwt.verify.mockReturnValue(decoded);
    User.findByPk.mockResolvedValue(userFixture.inactiveUser);

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Compte désactivé. Contactez le support.' })
    );
  });

  it('devrait attacher l\'utilisateur à req.user', async () => {
    const token = 'valid-token';
    const decoded = { id: userFixture.validUser.id, role: 'CLIENT' };

    req.headers.authorization = `Bearer ${token}`;
    jwt.verify.mockReturnValue(decoded);
    User.findByPk.mockResolvedValue(userFixture.validUser);

    await authMiddleware(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(userFixture.validUser.id);
    expect(req.user.email).toBe(userFixture.validUser.email);
  });
});
