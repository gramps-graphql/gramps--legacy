import gramps from '../src/gramps';
import * as cfg from '../src/lib/configureSchema';

// Stub out the functions that are tested elsewhere.
cfg.getSchema = jest.fn(opts => opts);
cfg.addMockFunctions = jest.fn();

describe('GrAMPS', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('gramps()', () => {
    it('properly configures a schema when called with no options', () => {
      const grampsConfig = gramps();

      expect(cfg.addMockFunctions).toHaveBeenCalled();
      expect(cfg.getSchema).toHaveBeenCalledWith({
        sources: [],
        logger: console,
        options: {},
      });

      expect(grampsConfig).toEqual(
        expect.objectContaining({
          context: {},
          schema: expect.any(Object),
        }),
      );
    });

    it('does not add mock functions when the enableMockData flag is false', () => {
      gramps({ enableMockData: false });

      expect(cfg.addMockFunctions).not.toHaveBeenCalled();
    });

    it('properly combines contexts', () => {
      const dataSources = [
        { namespace: 'Foo', model: { foo: 'test' } },
        { namespace: 'Bar', model: { bar: 'test' } },
      ];

      const grampsConfig = gramps({ dataSources });

      expect(grampsConfig.context).toEqual({
        Foo: {
          foo: 'test',
        },
        Bar: {
          bar: 'test',
        },
      });
    });

    it('properly adds extra context', () => {
      const grampsConfig = gramps({
        extraContext: () => ({ extra: 'test' }),
      });

      expect(grampsConfig.context).toEqual({
        extra: 'test',
      });
    });
  });
});
