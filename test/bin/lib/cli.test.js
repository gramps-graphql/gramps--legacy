const shell = require('shelljs');
const { getDataSource, getGrampsMode } = require('../../../bin/lib/cli');

describe('bin/lib/cli', () => {
  describe('getGrampsMode()', () => {
    it('returns mock mode by default', () => {
      expect(getGrampsMode()).toEqual('mock');
    });

    it('returns live mode if true is passed', () => {
      expect(getGrampsMode(true)).toEqual('live');
    });
  });

  describe('getDataSource()', () => {
    afterEach(() => {
      shell.rm('-rf', './.tmp');
    });

    it('returns empty if no data sources are supplied', () => {
      expect(getDataSource()).toEqual('');
    });

    it('logs an error if an invalid data source path is supplied', () => {
      const spy = jest.spyOn(shell, 'echo');

      console.log = jest.fn();

      getDataSource('.', 'not/a/path');

      expect(spy).toHaveBeenCalledWith(
        expect.stringMatching(/Data source .*? does not exist/),
      );
    });

    it('creates a data source if a valid path is supplied', () => {
      getDataSource('.', './test/fixtures/externalDataSourceOne');

      expect(shell.ls('./.tmp')).toEqual(
        expect.arrayContaining([
          'connector.js',
          'index.js',
          'mocks.js',
          'model.js',
          'node_modules',
          'resolvers.js',
          'schema.graphql',
        ]),
      );
    });
  });
});
