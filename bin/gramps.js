#!/usr/bin/env node

const argv = require('yargs')
  .command(
    'create [name]',
    'Create a new data source',
    require('./commands/create/create.js'),
  )
  .command('*', 'Run GrAMPS server', require('./commands/gramps/gramps.js'))
  .help()
  .alias('help', 'h').argv;
