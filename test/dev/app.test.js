/* eslint-disable global-require */
import request from 'supertest';

const QUERY = {
  query: 'query grampsVersion { grampsVersion }',
  operationName: 'grampsVersion',
  variables: {},
};

const QUERY_RESPONSE_MOCK = {
  data: {
    grampsVersion: 'Hello World',
  },
};

const QUERY_RESPONSE_LIVE = {
  data: {
    grampsVersion: '0.0.0-development',
  },
};

const MUTATION = {
  query: 'mutation grampsPing { grampsPing }',
  operationName: 'grampsPing',
  variables: {},
};

const MUTATION_RESPONSE_MOCK = {
  data: {
    grampsPing: 'Hello World',
  },
};

const MUTATION_RESPONSE_LIVE = {
  data: {
    grampsPing: 'GET OFF MY LAWN',
  },
};

describe('dev/app', () => {
  describe('/graphql', () => {
    beforeEach(() => {
      delete process.env.NODE_ENV;
      jest.resetModules();
    });

    it('should respond to GET requests in mock mode', async () => {
      expect.assertions(2);

      process.env.NODE_ENV = 'development';
      const app = require('../../src/dev/app').default;

      const response = await request(app)
        .get('/graphql')
        .query(QUERY);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(QUERY_RESPONSE_MOCK);
    });

    it('should respond to GET requests in live mode', async () => {
      expect.assertions(2);

      process.env.NODE_ENV = 'production';
      const app = require('../../src/dev/app').default;

      const response = await request(app)
        .get('/graphql')
        .query(QUERY);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(QUERY_RESPONSE_LIVE);
    });

    it('should respond to POST query requests in mock mode', async () => {
      expect.assertions(2);

      process.env.NODE_ENV = 'development';
      const app = require('../../src/dev/app').default;

      const response = await request(app)
        .post('/graphql')
        .send(QUERY);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(QUERY_RESPONSE_MOCK);
    });

    it('should respond to POST query requests in mock mode', async () => {
      expect.assertions(2);

      process.env.NODE_ENV = 'production';
      const app = require('../../src/dev/app').default;

      const response = await request(app)
        .post('/graphql')
        .send(QUERY);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(QUERY_RESPONSE_LIVE);
    });

    it('should respond to POST mutation requests in mock mode', async () => {
      expect.assertions(2);

      process.env.NODE_ENV = 'development';
      const app = require('../../src/dev/app').default;

      const response = await request(app)
        .post('/graphql')
        .send(MUTATION);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(MUTATION_RESPONSE_MOCK);
    });

    it('should respond to POST mutation requests in live mode', async () => {
      expect.assertions(2);

      process.env.NODE_ENV = 'production';
      const app = require('../../src/dev/app').default;

      const response = await request(app)
        .post('/graphql')
        .send(MUTATION);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(MUTATION_RESPONSE_LIVE);
    });
  });

  describe('/graphiql', () => {
    it('exposes GraphiQL for docs and debugging', async () => {
      expect.assertions(1);

      process.env.NODE_ENV = 'development';
      const app = require('../../src/dev/app').default;

      const response = await request(app).get('/graphiql');

      expect(response.statusCode).toBe(200);
    });
  });
});
