import IDataSource from './IDataSource';
import { merge } from 'lodash';
import IStitching from './IStitching';

export default (sources: { stitching: IStitching }[]) => (mergeInfo: any) => {
  return merge(
    {},
    ...sources.map(source => source.stitching.resolvers(mergeInfo)),
  );
};
