import fetchMock from 'fetch-mock';

import handleRemoteSchemas from '../../src/lib/handleRemoteSchemas';
import remoteIntrospectionSchema from '../fixtures/remoteIntrospectionSchema';

describe('lib/handleRemoteSchemas', () => {
  it('requests a schema from the remote url', async () => {
    fetchMock.mock(
      'http://coolremotegraphqlserver.com/graphql',
      remoteIntrospectionSchema,
    );

    const remoteSchema = await handleRemoteSchemas([
      {
        url: 'http://coolremotegraphqlserver.com/graphql',
      },
    ]);

    expect(typeof remoteSchema).toBe('object');
  });

  it('adds context if a setContextCallback is set', async () => {
    fetchMock.mock(
      'http://coolremotegraphqlserver.com/graphql',
      remoteIntrospectionSchema,
    );

    const remoteSchema = await handleRemoteSchemas([
      {
        url: 'http://coolremotegraphqlserver.com/graphql',
        setContextCallback: () => ({
          headers: {
            Authorization: '123',
          },
        }),
      },
    ]);

    expect(fetchMock._calls[0][1].headers.Authorization).toBe('123');
  });

  it('handles errors if the url is failing', async () => {
    fetchMock.mock(
      'http://coolremotegraphqlserver.com/graphql',
      remoteIntrospectionSchema,
    );
    fetchMock.mock('http://coolremotegraphqlserver2.com/graphql', 404);

    const remoteSchema = await handleRemoteSchemas([
      {
        url: 'http://coolremotegraphqlserver.com/graphql',
      },
      {
        url: 'http://coolremotegraphqlserver2.com/graphql',
      },
    ]);

    expect(remoteSchema.length).toBe(1);
  });

  afterEach(() => {
    fetchMock.restore();
  });
});
