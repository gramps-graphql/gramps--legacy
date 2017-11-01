import '../../src/dev/server';

import app from '../../src/dev/app';

jest.mock('get-port', () => jest.fn(() => Promise.resolve(8080)));

jest.mock('../../src/dev/app', () => ({
  set: jest.fn(),
  get: jest.fn(() => 9999),
  listen: jest.fn((port, fn) => fn()),
}));

jest.mock('../../src/lib/defaultLogger', () => ({
  info: jest.fn(),
}));

describe('dev/server', () => {
  it('sets the port appropriately', () => {
    expect(app.set).toHaveBeenCalledWith('port', 8080);
  });

  it('calls the listen method with the correct arguments', () => {
    expect(app.listen.mock.calls[0][0]).toBe(9999);
  });

  it('correctly sets the mode based on the env', async () => {
    jest.resetModules();

    process.env.NODE_ENV = 'production';

    // eslint-disable-next-line global-require
    const logger = require('../../src/lib/defaultLogger');
    const spy = jest.spyOn(logger, 'info');

    // eslint-disable-next-line global-require
    await require('../../src/dev/server');

    expect(spy).toHaveBeenCalledWith(
      expect.stringMatching(/running in live mode/),
    );
  });
});
