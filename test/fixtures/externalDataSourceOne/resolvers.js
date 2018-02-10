module.exports = {
  Query: {
    ExternalOne: (_, { foo }, context) =>
      new Promise((resolve, reject) => {
        context.ExternalOne.getDataById(foo)
          .then(resolve)
          .catch(reject);
      }),
  },
};
