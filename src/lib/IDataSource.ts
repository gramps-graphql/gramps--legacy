export default interface IDataSource {
  stitching?: {
    linkTypeDefs?: any;
    resolvers: any;
  };
  schema?: string;
  typeDefs?: any;
  resolvers?: any;
  mocks?: any;
  namespace: string;
  context?: any;
};
