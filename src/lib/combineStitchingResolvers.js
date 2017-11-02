import merge from 'lodash.merge';

export default sources => mergeInfo => {
  return merge(
    {},
    ...sources.map(source => source.stitching.resolvers(mergeInfo)),
  );
};
