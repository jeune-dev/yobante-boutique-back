// tests/fixtures/user.fixture.js

const userFixture = {
  validUser: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    nom: 'Doe',
    prenom: 'John',
    email: 'john.doe@example.com',
    password: '$2a$12$hashedpassword',
    telephone: '+33612345678',
    role: 'CLIENT',
    isActive: true,
    isVerified: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },

  validAdmin: {
    id: '550e8400-e29b-41d4-a716-446655440001',
    nom: 'Admin',
    prenom: 'Test',
    email: 'admin@yobante.com',
    password: '$2a$12$hashedpassword',
    telephone: '+33612345678',
    role: 'ADMIN',
    isActive: true,
    isVerified: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },

  inactiveUser: {
    id: '550e8400-e29b-41d4-a716-446655440002',
    nom: 'Inactive',
    prenom: 'User',
    email: 'inactive@example.com',
    password: '$2a$12$hashedpassword',
    role: 'CLIENT',
    isActive: false,
    isVerified: true
  },

  unverifiedUser: {
    id: '550e8400-e29b-41d4-a716-446655440003',
    nom: 'Unverified',
    prenom: 'User',
    email: 'unverified@example.com',
    password: '$2a$12$hashedpassword',
    role: 'CLIENT',
    isActive: true,
    isVerified: false
  },

  registerData: {
    nom: 'Smith',
    prenom: 'Alice',
    email: 'alice.smith@example.com',
    password: 'SecurePassword123!',
    telephone: '+33698765432'
  },

  invalidEmail: {
    nom: 'Test',
    prenom: 'User',
    email: 'invalid-email',
    password: 'SecurePassword123!'
  },

  weakPassword: {
    nom: 'Test',
    prenom: 'User',
    email: 'test@example.com',
    password: '123'
  }
};

module.exports = userFixture;
