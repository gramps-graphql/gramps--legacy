/* eslint-disable no-console */
import defaultLogger from '../../src/lib/defaultLogger';

describe('lib/defaultLogger', () => {
  it('uses the console for info logging', () => {
    console.info = jest.fn();

    defaultLogger.info('info test');

    expect(console.info).toHaveBeenCalledWith('info test');
  });

  it('uses the console for warn logging', () => {
    console.warn = jest.fn();

    defaultLogger.warn('warn test');

    expect(console.warn).toHaveBeenCalledWith('warn test');
  });

  it('uses the console for error logging', () => {
    console.error = jest.fn();

    defaultLogger.error('error test');

    expect(console.error).toHaveBeenCalledWith('error test');
  });
});
