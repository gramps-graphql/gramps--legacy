const nodePlop = require('node-plop');

exports.builder = yargs => {
  yargs.positional('name', {
    describe: 'Name of the new data source',
    type: 'string',
  });
};

exports.handler = argv => {
  const plop = nodePlop('bin/commands/create/plopfile.js');
  const generator = plop.getGenerator('source');
  generator.runPrompts(argv.name ? [argv.name] : []).then(generator.runActions);
};
