// tests/setup.js
require('dotenv').config({ path: '.env.test' });

// Secrets JWT requis par src/config/security.js — valeurs de test par défaut
// (n'écrasent PAS un éventuel .env.test). Doivent être présents ET tous différents.
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test_jwt_refresh_secret';
process.env.JWT_RESET_SECRET = process.env.JWT_RESET_SECRET || 'test_jwt_reset_secret';

// Mock les logs en test
jest.mock('../src/config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Timeout global pour tous les tests
jest.setTimeout(10000);
