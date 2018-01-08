import merge from 'lodash.merge';

export default sources => mergeInfo => {
  return merge(
    {},
    ...sources
      .filter(source => source.stitching)
      .map(source => source.stitching.resolvers(mergeInfo)),
    ...sources
      .filter(source => source.resolvers)
      .map(source => source.resolvers),
  );
};
