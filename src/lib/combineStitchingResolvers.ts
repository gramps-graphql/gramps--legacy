import IDataSource from "./IDataSource";

export default (sources: IDataSource[]) => (mergeInfo: any) => {
  return sources.reduce(
    (merged, source) => ({
      ...merged,
      ...(source.stitching ? source.stitching.resolvers(mergeInfo) : {})
    }),
    {}
  );
};
