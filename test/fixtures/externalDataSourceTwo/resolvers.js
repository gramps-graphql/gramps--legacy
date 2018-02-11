module.exports = {
  Query: {
    ExternalTwo: (_, { bar }, context) =>
      new Promise((resolve, reject) => {
        context.ExternalTwo.getDataById(bar)
          .then(resolve)
          .catch(reject);
      }),
  },
};
