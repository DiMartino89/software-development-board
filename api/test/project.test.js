const request = require('supertest');
const server = require('../index');
const Project = require('../models/project');
const ERRORS = require('../constants').ERRORS;

const seedproject = {
  name: 'Starter Projekt',
  description: 'This is a good starter Project',
};

const validRegistration = {
    name: 'Starter Projekt',
    description: 'This is a good starter Project',
};

describe('Project tests', () => {
  beforeAll(async () => {
    await new Project(seedproject).save();
  });

  it('should not allow a project to be created with missing information', async () => {
    const fields = Object.keys(validRegistration);

    fields.forEach(async (field) => {
      const invalidRegistration = Object.assign({}, validRegistration);
      delete invalidRegistration[field];

      const result = await request(server).post('/project/create').send(invalidRegistration);
      result.expect(422);
    });
  });

  it('should allow new projects to be created with valid credentials', async () => {
    await request(server).post('/project/create')
      .send(validRegistration)
      .expect(200);
  });

  // Remove saved project data from test database
  afterAll(() => project.remove({}));
});
