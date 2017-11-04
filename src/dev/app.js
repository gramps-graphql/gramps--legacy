import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';

import gramps from '../index';

const app = express();

const enableMockData =
  process.env.NODE_ENV !== 'production' && process.env.GRAMPS_MODE !== 'live';

app.use(bodyParser.json());

const getGrampsContext = gramps({
  dataSources: [],
  enableMockData,
  extraContext: req => ({ req }),
});

app.all('/graphql', graphqlExpress(getGrampsContext));

app.get(
  '/graphiql',
  graphiqlExpress({
    endpointURL: '/graphql',
  }),
);

export default app;
