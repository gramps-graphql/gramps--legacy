import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';

import gramps from '../index';

const app = express();

const enableMockData =
  process.env.NODE_ENV !== 'production' && process.env.GRAMPS_MODE !== 'live';

app.use(bodyParser.json());

app.all(
  '/graphql',
  graphqlExpress(req => {
    const args = gramps({
      dataSources: [],
      enableMockData,
      extraContext: req => ({ req }),
      req,
    });

    return args;
  }),
);

app.get(
  '/graphiql',
  graphiqlExpress({
    endpointURL: '/graphql',
  }),
);

export default app;
