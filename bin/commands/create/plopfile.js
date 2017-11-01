module.exports = plop => {
  plop.setGenerator('source', {
    description: 'GrAMPS Data Source',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Data Source name?',
      },
      {
        type: 'confirm',
        name: 'rest',
        message: 'Does this data source consume REST endpoints?',
        default: false,
      },
    ],
    actions: [
      {
        type: 'addMany',
        destination: '{{dashCase name}}',
        base: 'templates',
        templateFiles: 'templates/**/*.*',
      },
    ],
  });
};
