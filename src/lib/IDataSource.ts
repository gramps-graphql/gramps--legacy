import IStitching from './IStitching';

export default interface IDataSource {
  stitching?: IStitching;
  schema?: string;
  typeDefs?: any;
  resolvers?: any;
  mocks?: any;
  namespace: string;
  context?: any;
};
