import IDataSource from './IDataSource';
import { merge } from 'lodash';

export default (sources: IDataSource[]) => (mergeInfo: any) => {
  return merge(
    {},
    ...sources.map(
      source => source.stitching && source.stitching.resolvers(mergeInfo),
    ),
  );
};
