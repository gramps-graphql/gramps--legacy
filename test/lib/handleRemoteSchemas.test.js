import handleRemoteSchemas from '../../src/lib/handleRemoteSchemas';

describe('lib/handleRemoteSchemas', () => {
  it('executes', async () => {
    const remoteSchema = await handleRemoteSchemas([
      'https://dev.console.test.cloud.ibm.com/graphql',
    ]);

    expect(typeof remoteSchema).toBe('object');
  });
});
