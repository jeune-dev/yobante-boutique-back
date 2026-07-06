// tests/setup.js
require('dotenv').config({ path: '.env.test' });

// Mock les logs en test
jest.mock('../src/config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Timeout global pour tous les tests
jest.setTimeout(10000);
